#!/usr/bin/perl

use strict qw( vars refs );
use FileHandle;
use File::Copy;
use File::Path;
use Sybase::Simple;
use Sybase::DBlib;
use JSON;
use POSIX qw( mktime strftime );
use Getopt::Long;
use XML::Fast;
use Data::Dumper qw( Dumper );
use GSA::SolrServer;
use GSA::Config;
use GSA::Utilities;
use GSA::Log;
use Mail::Send;

use Env qw( DSQUERY );

sub dbEscape {
  my ( $str ) = @_;
  $str =~ s/'/''/g;
  return $str;
}


my %opts = (
  logname => 'ebuyopen_rfq_feed',
  outputdir => &getConfig( 'EBuyOpen', 'OutDir' ),
  moveto => &getConfig( 'EBuyOpen', 'ProcessedDir' )
);

if (@ARGV < 1) {
print <<END
This script indexes data into ebuy open based on RFQ Closed Date. 
What data to process:
  --recent         - Gets RFQs that were closed within the last two days.
  --rfqid RFQ12345 - Gets supplied rfq.
  --active         - Gets All active RFQs
  --closed         - Gets All closed RFQs
  --sdate 1/1/2014 - Gets RFQs that were closed after that date
  --files          - Used to index specific files into Solr, must be .json. 
  
  Other Options:
  --noindex        - Will get the files from the database, but not index them into Solr
  --noemail        - Disable email alerts
  --nocoop         - Will not index data into COOP Solr
END
;
exit;
}
GetOptions( \%opts, 
 'sdate=s',
 'bulk',
 'active',
 'files=s',
 'logname=s',
 'moveto=s',
 'outputdir=s',
 'pretty',
 'rfqid=s',
 'noindex',
 'nocoop',
 'noemail',
 'closed',
 'recent'
);
my %zzcolumnMap = (
  "r.OID" => "OID",
  "r.RFQ_ID" => "RFQID",
  "r.TITLE" => "Title",
  "r.DESCRIPTION" => "Description",
  "r.ISSUE_TIME" => "IssueDate",
  "r.CLOSE_TIME" => "CloseDate",
  "u.ADV_FIRST_NAME || ' ' || u.ADV_LAST_NAME" => "BuyerName",
  "u.EMAIL" => "BuyerEmail",
  "u.ADV_AGENCY_CODE" => "BuyerAgency",
);

my %columnMap = (
  "OID" => "r.OID",
  "RFQID" => "r.RFQ_ID",
  "Title" => "r.TITLE",
  "Description" => "r.DESCRIPTION",
  "IssueDate" => "CONVERT( VARCHAR, r.ISSUE_TIME, 121)",
  "CloseDate" => "CONVERT( VARCHAR, r.CLOSE_TIME, 121)",
  "BuyerName" => "u.ADV_FIRST_NAME || ' ' || u.ADV_LAST_NAME",
  "BuyerEmail" => "u.EMAIL",
  "BuyerAgency" => "u.ADV_AGENCY_CODE",
  "Status" => "(CASE WHEN r.RFQ_STATUS = 2 THEN 'Cancelled' WHEN r.CLOSE_TIME < getdate() THEN 'Closed' WHEN r.CLOSE_TIME > getdate() THEN 'Active' END)"
);

my @cols = map( "$columnMap{$_} AS $_", keys( %columnMap ));
my $cols = join ", ", @cols;

my $log = new GSA::Log( $opts{logname} );

my $outDir = $opts{outputdir};
mkpath $outDir unless ( -d $outDir );

my %agencyNames = ();

my @urls = split(',', &getConfig( 'EBuyOpen', 'ReportURL' ));
my $coll = &getConfig( 'EBuyOpen', 'Collection' );
my $attachPrefix = &getConfig( 'EBuyOpen', 'AttachPrefix' );
my $solr = GSA::SolrServer->new($urls[0],$log);
$solr->setAuth(&getConfig( 'EBuyOpen', 'Server' ), &getConfig( 'EBuyOpen', 'Realm' ), &getConfig( 'EBuyOpen', 'User' ), &getConfig( 'EBuyOpen', 'Pass' ));

my $csolr = 0;
if (&getConfig( 'EBuyOpen', 'COOPURL' )) {
  $csolr = GSA::SolrServer->new(&getConfig( 'EBuyOpen', 'COOPURL' ),$log);
  $csolr->setAuth(&getConfig( 'EBuyOpen', 'COOPServer' ), &getConfig( 'EBuyOpen', 'COOPRealm' ), &getConfig( 'EBuyOpen', 'COOPUser' ), &getConfig( 'EBuyOpen', 'COOPPass' ));
};
  

my $docctr = 0;
my $filectr = 0;
my $jsonFile = undef;
my $batchCount = 0;
my $json = JSON->new();
if ( $opts{pretty} ) {
  $json->canonical(1);
  $json->pretty(1) 
}

my $sybUser = &getConfig( 'Sybase', 'BVDBUser' );
my $sybPasswd = &getConfig( 'Sybase', 'BVDBPassword' );
$DSQUERY = &getConfig( 'Sybase', 'BVDBServer' );

my $dbh  = undef;
my $dbh2   = undef;
my $rfqSelect = "$cols FROM EB_RFQ r LEFT JOIN BV_USER_PROFILE u ON u.USER_ID = r.USER_ID";

&openData;

if ($opts{files}) {
  if (-d $opts{files}) {
    opendir my $dir, $opts{files};
    my @files = readdir $dir or die ("Couldn't get file listing in $opts{files}");
    closedir $dir;
    for my $file (@files) {
      if ($file =~ /.json$/) {
        $log->info("Indexing $opts{files}/$file");
        indexToSolr("$opts{files}/$file");
      }
    }
  } elsif (-f $opts{files}) {
        $log->info("Indexing $opts{files}");
        indexToSolr("$opts{files}");
  
  } else {
    $log->error("Not a valid directory: $opts{files}");
  }
  &commit();
  exit;
}

my $databaseMode = 0;


# We will be pulling from the database
$dbh  = new Sybase::DBlib $sybUser, $sybPasswd, $DSQUERY; 
$dbh2 = new Sybase::Simple  $sybUser, $sybPasswd, $DSQUERY;
if ( $dbh && $dbh2 ) {
  # Cache the agency names
  my $agcyRows = $dbh2->ArrayOfHash("SELECT ADV_AGENCY_ID, ADV_AGENCY_NAME from ADV_AGENCY");
  foreach my $row ( @$agcyRows  ) {
    $agencyNames{$row->{ADV_AGENCY_ID}} = $row->{ADV_AGENCY_NAME};
  }
  if ( $opts{bulk} ) {
    &processBulk;
  } elsif ( $opts{recent} ) {
    if ( $opts{active} ) { 
      &processBulk( "r.CLOSE_TIME > getdate()");
    }
    elsif ( $opts{closed} ) {
      &processBulk( "r.CLOSE_TIME > DATEADD ( DAY, -2, getdate() ) AND r.CLOSE_TIME < getdate()");
    } else {
      &processBulk( "r.CLOSE_TIME > DATEADD ( DAY, -2, getdate() )");
    }
    
  } elsif ( $opts{active} ) {
    &processBulk( "r.CLOSE_TIME > getdate()" );
  } elsif ( $opts{closed} ) {
    &processBulk( "r.CLOSE_TIME < getdate()" );
  } elsif ( $opts{sdate} ) {
    &processBulk( "r.CLOSE_TIME > \'$opts{sdate}\'" );    
  } elsif ( $opts{rfqid} ) {
    &processByID( $opts{rfqid} );
  }
} else {
  &genError("Coudln't connect to database");
  die;
}

&closeData;
&commit;

sub commit {
  unless ($opts{noindex}) {
    $log->debug("Sending a Commit to $solr->{URL}");
    my $rc = $solr->commit($coll);
    if (!$rc->is_success) {
      &genError("Couldn't Commit Solr: $solr->{URL}")
    }
    if ($csolr) {
      $log->debug("Sending a Commit to $csolr->{URL}");
      my $rc = $csolr->commit($coll);
      if (!$rc->is_success) {
        &genError("Couldn't Commit Solr: $csolr->{URL}")
      }
    }
  } else {
    $log->debug("Not commiting because of noindex");
  }
}

sub processByID {
  my ( $rfqid ) = @_;
  my $sql = qq(SELECT $rfqSelect WHERE RFQ_ID = '$rfqid' AND ISSUE_TIME > '10/1/2013' AND CLOSE_TIME < getdate());
  $log->debug( $sql );
  my $rfq = $dbh2->HashRow( $sql );
  if (length(keys %$rfq) < 2) {$log->info("Couldn't Find RFQ"); return;}
  &processDatabaseRow( $rfq );
}

sub processBulk {
  my ( $where ) = @_;
  my $minOID = 0;
  my $done = 0;
  while ( 1 ) {
    my $sql = qq(SELECT TOP 100 $rfqSelect WHERE OID > $minOID);
    $sql .= " AND ISSUE_TIME > '10/1/2013' ";
    $sql .= " AND $where" if ( $where );
    $sql .= " ORDER BY OID";
    $log->debug( $sql );
    $dbh->dbcmd( $sql ) || warn( "Error in dbcmd of $sql." ); 
    $dbh->dbsqlexec || warn( "Error in dbsqlexec of $sql." ); 
    $dbh->dbresults;
    last if ( $dbh->DBCOUNT == 0);
    while ( my $rfq = $dbh->dbnextrow(1,1) ) {
      my $OID = $rfq->{OID};
      $minOID = $OID;
      &processDatabaseRow( $rfq);
      %$rfq = ();
    }
  }
}

sub processDatabaseRow {
  my ( $rfq ) = @_;
  $log->debug(Dumper($rfq));
  my $id = $rfq->{RFQID};
  $log->info( "Processing RFQ $id ..." );
  $rfq->{StateLocal} = 1 if ( $id =~ /S$/ );
  $rfq->{id} = "$id RFQ";
  $rfq->{Description} = &cleanText($rfq->{Description});
  $rfq->{Title} = &cleanText($rfq->{Title});
  $rfq->{BuyerAgency} = $agencyNames{$rfq->{BuyerAgency}};
  $rfq->{IssueDate} =~ s/\//-/g;
  $rfq->{CloseDate} =~ s/\//-/g;
  
  $rfq->{IssueDateUTC} = convertDateToUTC( $rfq->{IssueDate} );
  $rfq->{CloseDateUTC} = convertDateToUTC( $rfq->{CloseDate} );  
  
  #Take out the time, per Cynthia's request 1/26/2015
  foreach my $f ('IssueDate', 'CloseDate') {
    my @t = split(' ',$rfq->{$f});
    $rfq->{$f} = $t[0];
  }
  
  # Get the schedule/SIN categories
  my $sql = "SELECT DISTINCT SCHEDULE_NUMBER, SPECIAL_ITEM_NUMBER FROM EB_RFQ_CATEGORIES WHERE OID = $rfq->{OID}";
  $log->debug( $sql );
  my $catRows = $dbh2->ArrayOfHash( $sql );
  foreach my $row ( @$catRows ) {
	&addListItem( $rfq, 'CSIN', "$row->{SCHEDULE_NUMBER}/$row->{SPECIAL_ITEM_NUMBER}"  );
    &addListItem( $rfq, 'SIN', $row->{SPECIAL_ITEM_NUMBER} );
    &addListItem( $rfq, 'Schedule', $row->{SCHEDULE_NUMBER} );
  }

  # Get the attachments  
  $sql = "select DOC_NAME, DOC_PATH from EB_RFQ_DOCUMENTS where OID = $rfq->{OID}";
  $log->debug( $sql );
  my $attRows = $dbh2->ArrayOfHash( $sql );
  my $attachNum = 1;
  foreach my $row ( @$attRows ) {
    &processAttachment( $rfq, $attachNum, $row->{DOC_NAME}, $row->{DOC_PATH} );
    ++$attachNum;
  }
  &writeRecord( $rfq );
  undef $rfq;
}

sub addListItem {
  my ( $rfq, $name, $value ) = @_;
  $rfq->{$name} .= $value.", ";
  
  if ($name eq 'SIN') {
	$name = 'SINs';
  } else {
	$name .= 's';
  }
  
  $rfq->{$name} = [] unless ( exists $rfq->{$name} );
  
  push @{$rfq->{$name}}, $value;
 
}

sub processAttachment {
  my ( $rfq, $attachNum, $docName, $docPath ) = @_;
  if ($docPath !~ /^http/i && $docPath !~ /^www/i && $docPath !~ /^https/i )  {
    $docPath =~ s/ /%20/g;
    $rfq->{'Attachment'.$attachNum} = $attachPrefix.$docPath; 
  } else {
    $rfq->{'Attachment'.$attachNum} = $docPath; 
  }
    $rfq->{AttachmentCount} = $attachNum;
}


sub writeRecord {
  my ( $rec ) = @_;
  delete($rec->{OID});
  
  for my $field (keys %{$rec}) {
	if ($rec->{$field} =~ /, $/) {
		chop $rec->{$field};
		chop $rec->{$field};
	}
  }
  
  print OUT ",\n" if ( $batchCount > 0 );
  print OUT $json->encode($rec);       
  ++$batchCount;
  ++$docctr;
  if ( $docctr % 5000 == 0 ) {
    &closeData();
    &openData();
  }
}

sub closeData {
  print OUT "\n]\n";
  close OUT;
  if ( $batchCount > 0 ) {
    $log->info( "Submitting file $jsonFile ..." );
    rename "$jsonFile.tmp", $jsonFile;
    my $r = indexToSolr($jsonFile);
    if ($r) {
      $log->info( "Processed $docctr RFQs ..." );
      move($jsonFile, "$opts{moveto}/") or die("Couldn't move $jsonFile to $opts{moveto}: $!");
    } else {
      $log->error("Couldn't index $jsonFile to Solr");
      &genError("ebuyOpen Indexing Error");
    }
  } else {
    unlink "$jsonFile.tmp";
  }
  
}

sub openData {
  my @lt = localtime;
  ++$filectr;
  my $ct = sprintf "%08d", $docctr;
  $jsonFile = strftime "$outDir/rfq-%Y%m%d-%H%M%S-$ct.json", @lt;
  open OUT, ">$jsonFile.tmp";
  print OUT "[\n";
  $batchCount = 0;
}

sub convertDateToUTC {
 my ( $date ) = @_;
  my ($year,$month, $mday, $hour, $min, $sec, $rest) = split /[^\d]/, $date;
  my @lt; 
  my $t = mktime( $sec, $min, $hour, $mday, $month-1, $year-1900, undef, undef, -1 );
  my @gmt = gmtime($t);
  my $result = strftime( "%FT%TZ", @gmt );
  return $result;
}

sub cleanText {
  my ( $text ) = @_;
  $text =~ s/[^\x20-\x7E]+/ /go;
  $text =~ s/[\s\t\n\r_+=]+/ /g;
  $text =~ s/\.+/\./g;
  $text =~ s/-+/-/g;
  $text =~ s/^\s+//;
  $text =~ s/\s+$//;
  return $text;
}

sub indexToSolr{ 
  my $file = shift;
  if ($opts{noindex}) {
    $log->info( "Not Indexing" );  
    return 1;
  }

  my $rc = $solr->streamFile($file,$coll,'file');
  if ($rc != 0 && $rc != 200) {
    &genError("Couldn't Index Data into $solr->{URL}: $rc");
    return 0;
  } else { $log->info("Indexed to $solr->{URL}")}
  
  my $rc = $csolr->streamFile($file,$coll,'file');
  if ($rc != 0 && $rc != 200) {
    &genError("Couldn't Index Data into $csolr->{URL}: $rc");
    return 0;
  } else { $log->info("Indexed to $csolr->{URL}")}
  
  return 1;
}

sub genError{
  my $err = shift;
  $log->error($err);
  if ($opts{noemail}) {
    $log->info ("Not Generating Email\n");
    return;
	}
  $log->info ("Generating Email\n");
  my $mail = new Mail::Send;
  my $host = `hostname`;
  $mail->to(&getConfig ('EBuyOpen', 'distro'));
  $mail->set( "From", "eBuyOpen\@$host" );
  $mail->subject( "eBuy Open Data Feed Error" );
  $mail->set( 'Reply-To', &getConfig ('EBuyOpen', 'distro') );
  my $mfh = $mail->open;
  print $mfh $err;
  $mfh->close;
}