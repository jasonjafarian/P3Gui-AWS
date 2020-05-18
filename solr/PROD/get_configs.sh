rsync -av solr@solr01p:/apps/solr/ebuyopen/solr/ebuyopen '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/'
rsync -av --exclude='lib' solr@solr01p:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/jetty/'
rsync -av solr@solr01p:/apps/solr/ebuyopen/etc '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/jetty/'
rsync -av solr@solr01p:/apps/solr/ebuyopen/resources/log4j.properties '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica1/resources/'

rsync -av solr@solr02p:/apps/solr/ebuyopen/solr/ebuyopen '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/'
rsync -av --exclude='lib' solr@solr02p:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/jetty/'
rsync -av solr@solr02p:/apps/solr/ebuyopen/etc '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/jetty/'
rsync -av solr@solr02p:/apps/solr/ebuyopen/resources/log4j.properties '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/PROD/replica2/resources/'
