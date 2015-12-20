package com.smartmenu.menu.item;

import net.sf.json.JSONObject;

import com.smartmenu.entity.Category;
import com.smartmenu.entity.Item;
import com.smartmenu.menu.modifier.Modifier;

public class SimpleItem extends BasicItem{
	private Modifier modifier=null;
	
	public SimpleItem(){
		
	}
	
	public SimpleItem(Item item){
		super(item);
	}
	
	public Modifier getModifier() {
		return modifier;
	}
	public void setModifier(Modifier modifier) {
		this.modifier = modifier;
	}
	
	public JSONObject toJson(){
		JSONObject json = super.toJson();
		json.put("subtype", 0); //for item
		
		if(modifier != null){
			json.put("modifier", modifier.toJson());
		}
		return json;
	}
}
