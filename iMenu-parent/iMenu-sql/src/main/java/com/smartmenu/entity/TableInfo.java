package com.smartmenu.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;


public class TableInfo {
	private String tableId;
	private String floorDesc;
	private String floorDesc2;
	private int maxChairs;
	private int status;   //0-available 2-occupied 3-printed 
	private Timestamp openTime;
	private BigDecimal openAmount;
	private int openChairs;
	private String oldTableId;
	public String getTableId() {
		return tableId;
	}
	public void setTableId(String tableId) {
		this.tableId = tableId;
	}
	
	public String getFloorDesc() {
		return floorDesc;
	}
	public void setFloorDesc(String floorDesc) {
		this.floorDesc = floorDesc;
	}
	public String getFloorDesc2() {
		return floorDesc2;
	}
	public void setFloorDesc2(String floorDesc2) {
		this.floorDesc2 = floorDesc2;
	}
	public int getMaxChairs() {
		return maxChairs;
	}
	public void setMaxChairs(int maxChairs) {
		this.maxChairs = maxChairs;
	}
	
	public int getStatus() {
		return status;
	}
	public void setStatus(int status) {
		this.status = status;
	}
	public Timestamp getOpenTime() {
		return openTime;
	}
	public void setOpenTime(Timestamp openTime) {
		this.openTime = openTime;
	}
	public BigDecimal getOpenAmount() {
		return openAmount;
	}
	public void setOpenAmount(BigDecimal openAmount) {
		this.openAmount = openAmount;
	}
	public int getOpenChairs() {
		return openChairs;
	}
	public void setOpenChairs(int openChairs) {
		this.openChairs = openChairs;
	}
	public String getOldTableId() {
		return oldTableId;
	}
	public void setOldTableId(String oldTableId) {
		this.oldTableId = oldTableId;
	}
	
	
}
