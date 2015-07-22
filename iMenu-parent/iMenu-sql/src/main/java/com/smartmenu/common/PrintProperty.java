package com.smartmenu.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PrintProperty {
	
	private int seq;
	
	public void setSeq(int seq) {
		this.seq = seq;
	}
	
	private String folder;
	
	public void setFolder(String folder) {
		this.folder = folder;
	}
	public synchronized int getSeq() {
		return seq++;
	}
	public String getFolder() {
		return folder;
	}
	
}
