rsync -av solr@solr01c:/apps/solr/ebuyopen/solr/ebuyopen '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/'
rsync -av --exclude='lib' solr@solr01c:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/jetty/'
rsync -av solr@solr01c:/apps/solr/ebuyopen/etc '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/jetty/'
rsync -av solr@solr01c:/apps/solr/ebuyopen/resources/log4j.properties '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/resources/'

rsync -av solr@solr02c:/apps/solr/ebuyopen/solr/ebuyopen '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/'
rsync -av --exclude='lib' solr@solr02c:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/jetty/'
rsync -av solr@solr02c:/apps/solr/ebuyopen/etc '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/jetty/'
rsync -av solr@solr02c:/apps/solr/ebuyopen/resources/log4j.properties '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/resources/'
