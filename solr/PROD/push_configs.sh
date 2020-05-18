rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/ebuyopen/'* solr@solr01p:/apps/solr/ebuyopen/solr/ebuyopen/
rsync -av --exclude='lib' '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/jetty/WEB-INF/'* solr@solr01p:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/jetty/etc/'* solr@solr01p:/apps/solr/ebuyopen/etc/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/resources/log4j.properties' solr@solr01p:/apps/solr/ebuyopen/resources/

rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/ebuyopen/'* solr@solr02p:/apps/solr/ebuyopen/solr/ebuyopen/
rsync -av --exclude='lib' '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/jetty/WEB-INF/'* solr@solr02p:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/jetty/etc/'* solr@solr02p:/apps/solr/ebuyopen/etc/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/resources/log4j.properties' solr@solr02p:/apps/solr/ebuyopen/resources/