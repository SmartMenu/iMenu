package com.smartmenu.entity;

public class LookupHeader {
	private String lookupId;
	private String lookupName;
	private String lookupName2;
	
	private int compulsory;
	private int minCount;
	private int maxCount;
	private int seq;
	
	private boolean defaultSelectAll;

	public String getLookupId() {
		return lookupId;
	}

	public void setLookupId(String lookupId) {
		this.lookupId = lookupId;
	}

	public String getLookupName() {
		return lookupName;
	}

	public void setLookupName(String lookupName) {
		this.lookupName = lookupName;
	}

	public String getLookupName2() {
		return lookupName2;
	}

	public void setLookupName2(String lookupName2) {
		this.lookupName2 = lookupName2;
	}

	public int getCompulsory() {
		return compulsory;
	}

	public void setCompulsory(int compulsory) {
		this.compulsory = compulsory;
	}

	public int getMinCount() {
		return minCount;
	}

	public void setMinCount(int minCount) {
		this.minCount = minCount;
	}

	public int getMaxCount() {
		return maxCount;
	}

	public void setMaxCount(int maxCount) {
		this.maxCount = maxCount;
	}

	public int getSeq() {
		return seq;
	}

	public void setSeq(int seq) {
		this.seq = seq;
	}

	public boolean isDefaultSelectAll() {
		return defaultSelectAll;
	}

	public void setDefaultSelectAll(boolean defaultSelectAll) {
		this.defaultSelectAll = defaultSelectAll;
	}

	
}
