package com.smartmenu.controllers;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.smartmenu.services.SettingService;

@Controller
public class SettingController {
	private static Logger log = Logger.getLogger(OrderController.class);
	@Autowired
	private SettingService settingService;
	
	@RequestMapping(value = "/action/getDeleteReason", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getDeleteReason(HttpServletResponse resp, @RequestParam String mac, @RequestParam String callback) throws IOException {
		log.info("/getDeleteReason: call setting handler deal the request");
		JSONObject json = settingService.dealReqDeleteReasons();
		log.info("/getDeleteReason: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/getShopAndPos", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getShopAndPos(HttpServletResponse resp, @RequestParam String mac, @RequestParam String callback) throws IOException
    {
		log.info("/getShopAndPos: call setting handler deal the request");
		JSONObject json = settingService.getShopAndPos(mac);
		log.info("/getShopAndPos: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/getServiceCharge", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getServiceCharge(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, 
    		@RequestParam String tableid, @RequestParam String callback) throws IOException
    {
		log.info("/getServiceCharge: call setting handler deal the request");
		JSONObject json = settingService.dealServiceChargeReq(tableid, shopid);
		log.info("/getServiceCharge: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/getTaxInfo", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getTaxInfo(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, 
    		@RequestParam String tableid, @RequestParam String callback) throws IOException
    {
		log.info("/getTaxInfo: call setting handler deal the request");
		JSONObject json = settingService.dealTaxReq(tableid, shopid);
		log.info("/getTaxInfo: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/getDiscounts", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getDiscounts(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, 
    		 @RequestParam String callback) throws IOException
    {
		log.info("/getDiscounts: call setting handler deal the request");
		JSONObject json = settingService.dealDiscounts(shopid);
		log.info("/getDiscounts: handle finished");
		return callback+"("+json.toString()+")";
    }
	
}
