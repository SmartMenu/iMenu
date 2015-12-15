package com.smartmenu.menu.setter;

import net.sf.json.JSONObject;

import com.smartmenu.menu.item.SimpleItem;

public class SetterDetail extends Setter{
	private SimpleItem item;
	public SetterDetail(SimpleItem item){
		this.item = item;
	}
	public String getId() {
		return item.getItemId();
	}
	@Override
	public void setSeq(int seq) {
		this.item.setSeq(seq);
	}
	public JSONObject toJson(){
		
		JSONObject json = item.toJson();
		json.put("type", "detail");
		json.put("price", item.getItemSetPrice());
		json.put("seq", item.getSeq());
		json.put("subtype", 4);  //subtype=4,sale_details
		return json;
	}
}
