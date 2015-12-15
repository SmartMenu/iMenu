package com.smartmenu.menu.modifier;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.math.BigDecimal;

import com.smartmenu.menu.setter.Setter;

import net.sf.json.JSONObject;

public class ModifierDetail extends Modifier{

	private BigDecimal price;
	
	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public JSONObject toJson(){
		JSONObject json = new JSONObject();
		json.put("type", "detail");
		json.put("item-id", getId());
		json.put("item-name", getName());
		json.put("item-name2", getName2());
		json.put("price", price);
		json.put("subtype", 2);
		json.put("seq", getSeq());
		return json;
	}

}
