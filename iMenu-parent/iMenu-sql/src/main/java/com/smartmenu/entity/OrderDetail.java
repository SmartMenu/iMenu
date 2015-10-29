package com.smartmenu.entity;

import java.math.BigDecimal;
import com.smartmenu.entity.Discount;
import com.smartmenu.entity.ServiceCharge;

public class OrderDetail {
	private String itemId;
	private int qty;
	private BigDecimal price;
	private int subtype;
	private int isModifier;
	private int linkRow;
	private BigDecimal modifierValue;
	private BigDecimal totalAmount;
	private int levelNo;
	private int discAble;
	private Discount discount;
	private BigDecimal discAmount;
	private int svchgAble;
	private ServiceCharge serviceCharge;
	private BigDecimal svchgAmount;
	private int taxAble;
	private Tax taxInfo;
	private BigDecimal taxAmount;
	private BigDecimal payAmount;
	private int seqNo;
	private String catId;
	private String desc;
	private String desc2;
	private String unit;//
	private int takeAway;
	
	private String catName;  //for detail shows up
	private String catName2;  //for detail shows up
	
	private String reasonCode;
	private String reasonDesc;
	private String reasonDesc2;
	
	public String getItemId() {
		return itemId;
	}
	public void setItemId(String itemId) {
		this.itemId = itemId;
	}
	public int getQty() {
		return qty;
	}
	public void setQty(int qty) {
		this.qty = qty;
	}
	public BigDecimal getPrice() {
		return price;
	}
	public void setPrice(BigDecimal price) {
		this.price = price;
	}
	
	public int getSubtype() {
		return subtype;
	}
	public void setSubtype(int subtype) {
		this.subtype = subtype;
	}
	
	public int getIsModifier() {
		return isModifier;
	}
	public void setIsModifier(int isModifier) {
		this.isModifier = isModifier;
	}
	public int getLinkRow() {
		return linkRow;
	}
	public void setLinkRow(int linkRow) {
		this.linkRow = linkRow;
	}
	public BigDecimal getModifierValue() {
		return modifierValue;
	}
	public void setModifierValue(BigDecimal modifierValue) {
		this.modifierValue = modifierValue;
	}
	public BigDecimal getTotalAmount() {
		return totalAmount;
	}
	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}
	
	public int getLevelNo() {
		return levelNo;
	}
	public void setLevelNo(int levelNo) {
		this.levelNo = levelNo;
	}
	public int getDiscAble() {
		return discAble;
	}
	public void setDiscAble(int discAble) {
		this.discAble = discAble;
	}
	public BigDecimal getDiscAmount() {
		return discAmount;
	}
	public void setDiscAmount(BigDecimal discAmount) {
		this.discAmount = discAmount;
	}
	
	public Discount getDiscount() {
		return discount;
	}
	public void setDiscount(Discount discount) {
		this.discount = discount;
	}
	public int getSvchgAble() {
		return svchgAble;
	}
	public void setSvchgAble(int svchgAble) {
		this.svchgAble = svchgAble;
	}
	public ServiceCharge getServiceCharge() {
		return serviceCharge;
	}
	public void setServiceCharge(ServiceCharge serviceCharge) {
		this.serviceCharge = serviceCharge;
	}
	public BigDecimal getSvchgAmount() {
		return svchgAmount;
	}
	public void setSvchgAmount(BigDecimal svchgAmount) {
		this.svchgAmount = svchgAmount;
	}
	
	public int getTaxAble() {
		return taxAble;
	}
	public void setTaxAble(int taxAble) {
		this.taxAble = taxAble;
	}
	public Tax getTaxInfo() {
		return taxInfo;
	}
	public void setTaxInfo(Tax taxInfo) {
		this.taxInfo = taxInfo;
	}
	public BigDecimal getTaxAmount() {
		return taxAmount;
	}
	public void setTaxAmount(BigDecimal taxAmount) {
		this.taxAmount = taxAmount;
	}
	public BigDecimal getPayAmount() {
		return payAmount;
	}
	public void setPayAmount(BigDecimal payAmount) {
		this.payAmount = payAmount;
	}
	public int getSeqNo() {
		return seqNo;
	}
	public void setSeqNo(int seqNo) {
		this.seqNo = seqNo;
	}
	public String getCatId() {
		return catId;
	}
	public void setCatId(String catId) {
		this.catId = catId;
	}
	public String getDesc() {
		return desc;
	}
	public void setDesc(String desc) {
		this.desc = desc;
	}
	public String getDesc2() {
		return desc2;
	}
	public void setDesc2(String desc2) {
		this.desc2 = desc2;
	}
	public String getUnit() {
		return unit;
	}
	public void setUnit(String unit) {
		this.unit = unit;
	}
	public int getTakeAway() {
		return takeAway;
	}
	public void setTakeAway(int takeAway) {
		this.takeAway = takeAway;
	}
	public String getCatName() {
		return catName;
	}
	public void setCatName(String catName) {
		this.catName = catName;
	}
	public String getCatName2() {
		return catName2;
	}
	public void setCatName2(String catName2) {
		this.catName2 = catName2;
	}
	public String getReasonCode() {
		return reasonCode;
	}
	public void setReasonCode(String reasonCode) {
		this.reasonCode = reasonCode;
	}
	public String getReasonDesc() {
		return reasonDesc;
	}
	public void setReasonDesc(String reasonDesc) {
		this.reasonDesc = reasonDesc;
	}
	public String getReasonDesc2() {
		return reasonDesc2;
	}
	public void setReasonDesc2(String reasonDesc2) {
		this.reasonDesc2 = reasonDesc2;
	}
	
	
	
}
