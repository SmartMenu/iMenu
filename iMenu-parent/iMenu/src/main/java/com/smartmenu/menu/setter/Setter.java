package com.smartmenu.menu.setter;

import java.io.IOException;
import java.io.Serializable;

import net.sf.json.JSONObject;

public abstract class Setter implements Serializable{

	private String id;
	private String name;
	private String name2;
	private int seq=1;
	
	public Setter(){}
		
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getName2() {
		return name2;
	}
	public void setName2(String name2) {
		this.name2 = name2;
	}
	
	public int getSeq() {
		return seq;
	}

	public void setSeq(int seq) {
		this.seq = seq;
	}

	public abstract JSONObject toJson();
	
}
