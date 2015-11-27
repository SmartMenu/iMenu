package com.smartmenu.services;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartmenu.controllers.OrderController;
import com.smartmenu.db.DBSetting;
import com.smartmenu.entity.DeleteReason;
import com.smartmenu.entity.Discount;
import com.smartmenu.entity.ServiceCharge;
import com.smartmenu.entity.Tax;
import com.smartmenu.utils.ReturnMsgCode;

@Service
public class SettingService {
	@Autowired
	private DBSetting dbSetting;
	private static Logger log = Logger.getLogger(SettingService.class);
	//get the delete reasons
	public JSONObject dealReqDeleteReasons(){
		JSONObject json = new JSONObject();
		JSONArray jaData = new JSONArray();
		
		DeleteReason[] drs = dbSetting.getDeleteSettings();
		if(drs!=null){
			for(DeleteReason dr: drs){
				JSONObject detail = new JSONObject();
				detail.put("code", dr.getCode());
				detail.put("desc", dr.getDesc());
				detail.put("desc2", dr.getDesc2());
				jaData.add(detail);
			}
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.SUCCESS);
			json.put("data", jaData);
		}else{
			json.put("status", 1);
			json.put("msg", ReturnMsgCode.DATA_IS_NULL);
		}
		return json;
	}
	
	//get shopid and posid by mac
	public JSONObject getShopAndPos(String mac){
		JSONObject json = new JSONObject();
		JSONObject jData = new JSONObject();
		String[] temp = dbSetting.getShopIdAndPosId(mac);
		if(temp == null){
			json.put("status", 1);
			json.put("msg", ReturnMsgCode.DATA_ERROR);
		}else{
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.SUCCESS);
			jData.put("shop-id", temp[0]);
			jData.put("pos-id", temp[1]);
			json.put("data", jData);
		}
		return json;
	}
	
	//get service charge of the section that the table is in;
	public JSONObject dealServiceChargeReq(String tableId, String shopId){
		ServiceCharge[] serviceCharges = dbSetting.getServiceCharge(tableId, shopId);
		JSONObject json = new JSONObject();
		JSONObject jData = new JSONObject();
		
		if(serviceCharges==null){
			json.put("status", 1);
			json.put("msg", ReturnMsgCode.DATA_ERROR);
		}else if(serviceCharges.length == 0){
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.DATA_IS_NULL);
		}
		else{
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.SUCCESS);
			ServiceCharge serviceCharge = serviceCharges[0];
			jData.put("id", serviceCharge.getId());
			jData.put("desc", serviceCharge.getDesc());
			jData.put("desc2", serviceCharge.getDesc2());
			jData.put("value", serviceCharge.getValue());
			jData.put("type", serviceCharge.getType());
			
			json.put("data", jData);
		}
		
		return json;
	}
	
	//get tax info
	public JSONObject dealTaxReq(String tableId, String shopId){
		Tax[] taxs = dbSetting.getTaxInfo(tableId, shopId);
		JSONObject json = new JSONObject();
		JSONObject jData = new JSONObject();
		
		if(taxs==null){
			json.put("status", 1);
			json.put("msg", ReturnMsgCode.DATA_ERROR);
		}else if(taxs.length == 0){
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.DATA_IS_NULL);
		}
		else{
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.SUCCESS);
			Tax tax = taxs[0];
			jData.put("tax-id", tax.getTaxId());
			jData.put("tax-desc", tax.getTaxDesc());
			jData.put("tax-desc2", tax.getTaxDesc2());
			jData.put("tax-value", tax.getTaxValue());
			jData.put("tax-type", tax.getTaxType());
			
			json.put("data", jData);
		}
		
		return json;
	}
	
	//get discounts info
	public JSONObject dealDiscounts(String shopId){
		JSONObject json = new JSONObject();
		JSONArray jData = new JSONArray();
		Discount[] discounts = dbSetting.getDiscounts(shopId);
		if(discounts == null){
			json.put("status", 1);
			json.put("msg", ReturnMsgCode.DATA_ERROR);
		}else if(discounts.length == 0){
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.DATA_IS_NULL);
		}
		else{
			for(Discount disc : discounts){
				JSONObject jDetail = new JSONObject();
				jDetail.put("id", disc.getDiscId());
				jDetail.put("disc-type", disc.getDiscType());
				jDetail.put("rate", disc.getDiscRate());
				jDetail.put("desc", disc.getDiscDesc());
				jDetail.put("desc2", disc.getDiscDesc2());
				
				jData.add(jDetail);
			}
			json.put("status", 0);
			json.put("msg", ReturnMsgCode.SUCCESS);
			json.put("data", jData);
		}
		
		return json;
		
	}
	
}
