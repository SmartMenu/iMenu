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

import com.smartmenu.services.MenuService;

@Controller
public class MenuController {
	private static Logger log = Logger.getLogger(MenuController.class); 

	@Autowired
	private MenuService menuService;

	@RequestMapping(value = "/action/getMenu", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doGetMenu2(HttpServletResponse resp, @RequestParam String callback, @RequestParam String mac, @RequestParam String shopid, @RequestParam String posid) throws IOException
    {
		log.info("/getMenu: call menu service deal the request");
		JSONObject json = menuService.getMenu(shopid, posid, mac);
		log.info("/getMenu: deal with request completed");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/getSoldoutInfo", method = RequestMethod.GET,produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
	String doGetSoldoutInfo(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid,
								@RequestParam String callback) throws IOException
    {
		log.info("/getSoldoutInfo: call menu service deal the request");
		JSONObject json = menuService.getItemSoldoutInfo(shopid);
		log.info("/getSoldoutInfo: deal with request completed");
		return callback+"("+json.toString()+")";
    }
	
}
