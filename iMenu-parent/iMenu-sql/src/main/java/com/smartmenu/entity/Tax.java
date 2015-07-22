package com.smartmenu.entity;

import java.math.BigDecimal;

public class Tax {
	private String taxId;
	private String taxDesc;
	private String taxDesc2;
	private BigDecimal taxValue;
	private int taxType;
	public String getTaxId() {
		return taxId;
	}
	public void setTaxId(String taxId) {
		this.taxId = taxId;
	}
	public BigDecimal getTaxValue() {
		return taxValue;
	}
	public void setTaxValue(BigDecimal taxValue) {
		this.taxValue = taxValue;
	}
	public String getTaxDesc() {
		return taxDesc;
	}
	public void setTaxDesc(String taxDesc) {
		this.taxDesc = taxDesc;
	}
	public String getTaxDesc2() {
		return taxDesc2;
	}
	public void setTaxDesc2(String taxDesc2) {
		this.taxDesc2 = taxDesc2;
	}
	public int getTaxType() {
		return taxType;
	}
	public void setTaxType(int taxType) {
		this.taxType = taxType;
	}
	
}
