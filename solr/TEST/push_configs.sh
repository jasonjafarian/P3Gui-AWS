rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica1/ebuyopen/'* solr@solr01t:/apps/solr/ebuyopen/solr/ebuyopen/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica1/feedback/'* solr@solr01t:/apps/solr/ebuyopen/solr/feedback/
rsync -av --exclude='lib' '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica1/jetty/WEB-INF/'* solr@solr01t:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica1/jetty/etc/'* solr@solr01t:/apps/solr/ebuyopen/etc/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica1/resources/log4j.properties' solr@solr01t:/apps/solr/ebuyopen/resources/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica2/feedback/'* solr@solr02t:/apps/solr/ebuyopen/solr/feedback/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica2/ebuyopen/'* solr@solr02t:/apps/solr/ebuyopen/solr/ebuyopen/
rsync -av --exclude='lib' '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica2/jetty/WEB-INF/'* solr@solr02t:/apps/solr/ebuyopen/solr-webapp/webapp/WEB-INF/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica2/jetty/etc/'* solr@solr02t:/apps/solr/ebuyopen/etc/
rsync -av '/cygdrive/c/Users/NikitaVasilyev/Documents/Data/EBuy Open/Code/SVN/solr/TEST/replica2/resources/log4j.properties' solr@solr02t:/apps/solr/ebuyopen/resources/