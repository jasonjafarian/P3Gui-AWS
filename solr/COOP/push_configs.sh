rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/ebuyopen/'* solr@solr01c:/apps/solr/ebuyopen/solr/ebuyopen/
rsync -av --exclude='lib' '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/jetty/WEB-INF/'* solr@solr01c:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/jetty/etc/'* solr@solr01c:/apps/solr/ebuyopen/etc/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica1/resources/log4j.properties' solr@solr01c:/apps/solr/ebuyopen/resources/

rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/ebuyopen/'* solr@solr02c:/apps/solr/ebuyopen/solr/ebuyopen/
rsync -av --exclude='lib' '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/jetty/WEB-INF/'* solr@solr02c:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/jetty/etc/'* solr@solr02c:/apps/solr/ebuyopen/etc/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/COOP/replica2/resources/log4j.properties' solr@solr02c:/apps/solr/ebuyopen/resources/