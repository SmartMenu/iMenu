package com.smartmenu.services;

import java.text.SimpleDateFormat;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartmenu.controllers.OrderController;
import com.smartmenu.db.DBTable;
import com.smartmenu.entity.TableInfo;
import com.smartmenu.utils.ReturnMsgCode;

@Service
public class TableService {
	@Autowired
	private DBTable dbTable;
	private static Logger log = Logger.getLogger(TableService.class);
	
	public JSONObject dealTableSymbolReq(String shopId){
		TableInfo[] tables = dbTable.getTables(shopId);
		JSONObject json = new JSONObject();
		JSONArray jaData = new JSONArray();
		if(tables==null){
			json.put("status", 1);
			json.put("msg", ReturnMsgCode.DATA_ERROR);
		}else{
			
			StringBuffer sb = new StringBuffer();
			for(TableInfo table: tables){
				char[] tmp = table.getTableId().toCharArray();
				for(char c: tmp){
					if(sb.indexOf(String.valueOf(c))==-1)
						sb.append(c);
				}
			}
			char[] symbols = sb.toString().toCharArray();
			for(char c: symbols){
				jaData.add(c);
			}
			
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.SUCCESS);
			json.put("data", jaData);
		}
		
		return json;
	}
	
	public JSONObject dealTableReq(String shopId){
		TableInfo[] tables = dbTable.getTables(shopId);
		JSONObject json = new JSONObject();
		JSONArray jaData = new JSONArray();

		if(tables==null){
			json.put("status", 1);
			json.put("msg", ReturnMsgCode.DATA_ERROR);
		}else{
			
			for(TableInfo table: tables){
				JSONObject jsonTb = new JSONObject();
				jsonTb.put("id", table.getTableId());
				jsonTb.put("floor", table.getFloorDesc());
				jsonTb.put("floor2", table.getFloorDesc2());
				jsonTb.put("chair", table.getMaxChairs());
				jsonTb.put("status", table.getStatus());
				if(table.getStatus()==0){
					jsonTb.put("open-time", "");
					jsonTb.put("open-chair", "");
					jsonTb.put("open-amount", "");
				}else{
					SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm");
					if(table.getOpenTime() == null)
						jsonTb.put("open-time", "");
					else{
						log.info(table.getOpenTime().toString());
						jsonTb.put("open-time", df.format(table.getOpenTime()));
					}
					jsonTb.put("open-chair", table.getOpenChairs());
					jsonTb.put("open-amount", table.getOpenAmount());
				}
				jsonTb.put("source-table", "");	
				jaData.add(table);
			}
			
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.SUCCESS);
			json.put("data", jaData);
		}
		
		return json;
	}
	
}
