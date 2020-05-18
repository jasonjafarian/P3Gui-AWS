package p3.util;

import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;

public class SolrRoundRobinHosts {
	private Iterator<Integer> roundRobinIterator;
	private List<Integer> roundRobinIndexes;
	
	private List<String> hosts;
  
	public SolrRoundRobinHosts( String primaryHost, String secondaryHost ) {
		this.hosts = new ArrayList<String>();
		this.hosts.add(primaryHost);
		this.hosts.add(secondaryHost);
		
		roundRobinIndexes = new ArrayList<Integer>();
		int index = 0;
		for ( String host : hosts ) {
			roundRobinIndexes.add(index);
			index++;
		}
		
		roundRobinIterator = roundRobinIndexes.iterator();
	}
 
	public RoundRobinHostDetail next() {
		// if we get to the end, start again
		if (!roundRobinIterator.hasNext()) {
			roundRobinIterator = roundRobinIndexes.iterator();
		}
		Integer robin = roundRobinIterator.next();
		
		RoundRobinHostDetail detail = new RoundRobinHostDetail(getHost(robin), getFailoverHost(robin));
		
		return detail;
	}
	
	private String getHost(int roundRobinIndex) {
		return this.hosts.get(roundRobinIndex);
	}
	
	private String getFailoverHost(int roundRobinIndex) {
		if ( roundRobinIndex == 0 ) {
			return this.hosts.get(1);
		} else {
			return this.hosts.get(0);
		}
	}
	
	public class RoundRobinHostDetail {
		private String primaryHost;
		private String failoverHost;
		
		public RoundRobinHostDetail(String primaryHost, String failoverHost) {
			this.primaryHost = primaryHost;
			this.failoverHost = failoverHost;
		}
		
		public String getPrimaryHost() {
			return this.primaryHost;
		}
		
		public String getFailoverHost() {
			return this.failoverHost;
		}
		
		public String toString() {
			StringBuffer sb = new StringBuffer();
			sb.append("[" );
			sb.append( " primaryHost : " + this.primaryHost );
			sb.append( ", failoverHost : " + this.failoverHost );
			sb.append("]");
			
			return sb.toString();
		}
	}
	
}
