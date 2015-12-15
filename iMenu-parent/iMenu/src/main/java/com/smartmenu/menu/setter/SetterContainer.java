package com.smartmenu.menu.setter;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;

public class SetterContainer extends Setter {
	
	private static Logger log = Logger.getLogger(SetterContainer.class);
	
	private boolean defaultSelectAll;
	private int compulsory;
	private int minCount;
	private int maxCount;
	private List<Setter> lsSetters;
	public boolean isDefaultSelectAll() {
		return defaultSelectAll;
	}
	public void setDefaultSelectAll(boolean defaultSelectAll) {
		this.defaultSelectAll = defaultSelectAll;
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

	public List<Setter> getLsSetters() {
		return lsSetters;
	}

	public void setLsSetters(List<Setter> lsSetters) {
		this.lsSetters = lsSetters;
	}
	
	public void addSetter(Setter setter){
		if(lsSetters == null)
			lsSetters = new ArrayList<Setter>();
		lsSetters.add(setter);
	}
	
	public SetterContainer() {
	}

	@Override
	public JSONObject toJson() {
		JSONObject json = new JSONObject();
		json.put("type", "setter");
		json.put("lookup-id", getId());
		json.put("lookup-name", getName());
		json.put("lookup-name2", getName2());
		json.put("seq", getSeq());
		json.put("compulsory", this.getCompulsory());
		json.put("min-count", this.getMinCount());
		json.put("max-count", this.getMaxCount());
				
		if(defaultSelectAll)
			json.put("select-all", "1");
		else
			json.put("select-all", "0");
		if(lsSetters != null){
			JSONArray ja = new JSONArray();
			for (Setter setter : lsSetters) {
				ja.add(setter.toJson());
			}
			json.put("details", ja);
		}
		else
			json.put("details", "[]");
		return json;
	}
	
	public SetterContainer deepClone() {
		ObjectInputStream oi=null;
		SetterContainer sc=null;
		try{
			
			ByteArrayOutputStream bo=new ByteArrayOutputStream();
			ObjectOutputStream oo=new ObjectOutputStream(bo);
			oo.writeObject(this);//从流里读出来
			oo.close();
			ByteArrayInputStream bi=new ByteArrayInputStream(bo.toByteArray());
		    oi=new ObjectInputStream(bi);
			sc = (SetterContainer)oi.readObject();
			
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			log.error("Setter Container deep clone failed(ClassNotFoundException).");
		} catch (IOException e) {
			e.printStackTrace();
			log.error("Setter Container deep clone failed(IOException).");
		} finally{
			if(oi!=null)
				try {
					oi.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
		}
		return sc;
	}

}
