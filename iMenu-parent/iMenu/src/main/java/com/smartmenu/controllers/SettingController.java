package com.smartmenu.controllers;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

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
	
	@Autowired
	private SettingService settingService;
	
	@RequestMapping(value = "/getDeleteReason", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getDeleteReason(HttpServletResponse resp, @RequestParam String mac, @RequestParam String callback) throws IOException {
		System.out.println("/getDeleteReason: call setting handler deal the request");
		JSONObject json = settingService.dealReqDeleteReasons();
		System.out.println("/getDeleteReason: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/getShopAndPos", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getShopAndPos(HttpServletResponse resp, @RequestParam String mac, @RequestParam String callback) throws IOException
    {
		System.out.println("/getShopAndPos: call setting handler deal the request");
		JSONObject json = settingService.getShopAndPos(mac);
		System.out.println("/getShopAndPos: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/getServiceCharge", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getServiceCharge(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, 
    		@RequestParam String tableid, @RequestParam String callback) throws IOException
    {
		System.out.println("/getServiceCharge: call setting handler deal the request");
		JSONObject json = settingService.dealServiceChargeReq(tableid, shopid);
		System.out.println("/getServiceCharge: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/getTaxInfo", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getTaxInfo(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, 
    		@RequestParam String tableid, @RequestParam String callback) throws IOException
    {
		System.out.println("/getTaxInfo: call setting handler deal the request");
		JSONObject json = settingService.dealServiceChargeReq(tableid, shopid);
		System.out.println("/getTaxInfo: handle finished");
		return callback+"("+json.toString()+")";
    }
}
