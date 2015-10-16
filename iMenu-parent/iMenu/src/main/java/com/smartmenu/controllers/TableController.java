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

import com.smartmenu.services.TableService;

@Controller
public class TableController {
	
	@Autowired
	private TableService tableService;

	@RequestMapping(value = "/action/getTableSymbol", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getTableSymbol(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid,
    					@RequestParam String callback) throws IOException
    {
		System.out.println("/getTableSymbol: call table handler deal the request");
		JSONObject json = tableService.dealTableSymbolReq(shopid);
		System.out.println("/getTableSymbol: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/getTables", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getTables(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid,
    					@RequestParam String callback) throws IOException
    {
		
		System.out.println("/getTables: call table handler deal the request");
		JSONObject json = tableService.dealTableReq(shopid);
		System.out.println("/getTables: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	
}
