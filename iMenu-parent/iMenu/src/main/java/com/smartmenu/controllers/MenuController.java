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

import com.smartmenu.services.MenuService;

@Controller
public class MenuController {
	

	@Autowired
	private MenuService menuService;

	@RequestMapping(value = "/getMenu", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doGetMenu2(HttpServletResponse resp, @RequestParam String callback, @RequestParam String mac, @RequestParam String shopid, @RequestParam String posid) throws IOException
    {
		System.out.println("/getMenu: call menu service deal the request");
		JSONObject json = menuService.getMenu(shopid, posid, mac);
		System.out.println("/getMenu: deal with request completed");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/getSoldoutInfo", method = RequestMethod.GET,produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
	String doGetSoldoutInfo(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid,
								@RequestParam String callback) throws IOException
    {
		System.out.println("/getSoldoutInfo: call menu service deal the request");
		JSONObject json = menuService.getItemSoldoutInfo(shopid);
		System.out.println("/getSoldoutInfo: deal with request completed");
		return callback+"("+json.toString()+")";
    }
	
}
