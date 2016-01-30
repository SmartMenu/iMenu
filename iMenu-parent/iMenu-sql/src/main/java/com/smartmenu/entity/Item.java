package com.smartmenu.entity;

import java.math.BigDecimal;

public class Item {
	private String itemId;
	private String itemName;
	private String itemName2;
	private String pluNo;
	private int seq;
	private String itemDesc;
	private String itemDesc2;
	private String itemPic;
	private BigDecimal itemPrice;
	private BigDecimal itemSetPrice;
	private String unit;
	private int discountable;
	private int taxable;
	private int svchgAble;
	
	private int isModifier;
	private String modifierId;
	private String setId;
	
	
	
	private Category category;
	
	public String getItemId() {
		return itemId;
	}
	public void setItemId(String itemId) {
		this.itemId = itemId;
	}
	public String getItemName() {
		return itemName;
	}
	public void setItemName(String itemName) {
		this.itemName = itemName;
	}
	
	public String getItemName2() {
		return itemName2;
	}
	public void setItemName2(String itemName2) {
		this.itemName2 = itemName2;
	}
	public int getSeq() {
		return seq;
	}
	public void setSeq(int seq) {
		this.seq = seq;
	}
	public String getItemDesc() {
		return itemDesc;
	}
	public void setItemDesc(String itemDesc) {
		this.itemDesc = itemDesc;
	}
	public String getItemDesc2() {
		return itemDesc2;
	}
	public void setItemDesc2(String itemDesc2) {
		this.itemDesc2 = itemDesc2;
	}
	public String getItemPic() {
		return itemPic;
	}
	public void setItemPic(String itemPic) {
		this.itemPic = itemPic;
	}
	public BigDecimal getItemPrice() {
		return itemPrice;
	}
	public void setItemPrice(BigDecimal itemPrice) {
		this.itemPrice = itemPrice;
	}
	
	public BigDecimal getItemSetPrice() {
		return itemSetPrice;
	}
	public void setItemSetPrice(BigDecimal itemSetPrice) {
		this.itemSetPrice = itemSetPrice;
	}
	public Category getCategory() {
		return category;
	}
	public void setCategory(Category category) {
		this.category = category;
	}

	public String getUnit() {
		return unit;
	}
	public void setUnit(String unit) {
		this.unit = unit;
	}
	
	public int getDiscountable() {
		return discountable;
	}
	public void setDiscountable(int discountable) {
		this.discountable = discountable;
	}
	
	public int getTaxable() {
		return taxable;
	}
	public void setTaxable(int taxable) {
		this.taxable = taxable;
	}
	public int getSvchgAble() {
		return svchgAble;
	}
	public void setSvchgAble(int svchgAble) {
		this.svchgAble = svchgAble;
	}
	public String getPluNo() {
		return pluNo;
	}
	public void setPluNo(String pluNo) {
		this.pluNo = pluNo;
	}
	
	public int getIsModifier() {
		return isModifier;
	}
	public void setIsModifier(int isModifier) {
		this.isModifier = isModifier;
	}
	public String getModifierId() {
		return modifierId;
	}
	public void setModifierId(String modifierId) {
		this.modifierId = modifierId;
	}
	public String getSetId() {
		return setId;
	}
	public void setSetId(String setId) {
		this.setId = setId;
	}
	@Override
	public boolean equals(Object obj) {
		Item item = (Item)obj;
		if(this.itemId.equals(item.getItemId()))
			return true;
		else
			return false;
	}
	
	
}
