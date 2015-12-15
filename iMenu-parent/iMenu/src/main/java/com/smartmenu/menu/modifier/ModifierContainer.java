package com.smartmenu.menu.modifier;

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

public class ModifierContainer extends Modifier{
	
	private static Logger log = Logger.getLogger(ModifierContainer.class);
	
	private int compulsory;
	private int minCount;
	private int maxCount;

	private List<Modifier> lsModifiers;

	public ModifierContainer() {
		super();
	}

	public List<Modifier> getLsModifiers() {
		return lsModifiers;
	}

	public void setLsModifiers(List<Modifier> lsModifiers) {
		this.lsModifiers = lsModifiers;
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
	
	public void addModifier(Modifier modifier){
		if(lsModifiers==null)
			lsModifiers = new ArrayList<Modifier>();
		lsModifiers.add(modifier);
	}
	
	
	@Override
	public JSONObject toJson() {
		JSONObject json = new JSONObject();
		json.put("type", "modifier");
		json.put("modifier-id", getId());
		json.put("modifier-name", getName());
		json.put("modifier-name2", getName2());
		json.put("compulsory", getCompulsory());
		json.put("min-count", getMinCount());
		json.put("max-count", getMaxCount());
		json.put("seq", getSeq());
		JSONArray ja = new JSONArray();
		if(lsModifiers!=null){
			for(Modifier modifier: lsModifiers){
				ja.add(modifier.toJson());
			}
		}
		json.put("details", ja);
		return json;
	}

	public ModifierContainer deepClone() {
		ModifierContainer mc=null;
		ObjectInputStream oi=null;
		try{
			
			ByteArrayOutputStream bo=new ByteArrayOutputStream();
			ObjectOutputStream oo=new ObjectOutputStream(bo);
			oo.writeObject(this);//从流里读出来
			oo.close();
			ByteArrayInputStream bi=new ByteArrayInputStream(bo.toByteArray());
		    oi=new ObjectInputStream(bi);
			mc = (ModifierContainer)oi.readObject();
			
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			log.error("Modifier Container deep clone failed(ClassNotFoundException)");
		} catch (IOException e) {
			e.printStackTrace();
			log.error("Modifier Container deep clone failed(IOException)");
		} finally{
			if(oi!=null)
				try {
					oi.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
		}
		return mc;
	}
}
