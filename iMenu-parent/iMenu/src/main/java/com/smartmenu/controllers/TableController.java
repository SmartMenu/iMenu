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

import com.smartmenu.services.TableService;

@Controller
public class TableController {
	private static Logger log = Logger.getLogger(TableController.class);
	@Autowired
	private TableService tableService;

	@RequestMapping(value = "/action/getTableSymbol", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getTableSymbol(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid,
    					@RequestParam String callback) throws IOException
    {
		log.info("/getTableSymbol: call table handler deal the request");
		JSONObject json = tableService.dealTableSymbolReq(shopid);
		log.info("/getTableSymbol: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/getTables", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String getTables(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid,
    					@RequestParam String callback) throws IOException
    {
		
		log.info("/getTables: call table handler deal the request");
		JSONObject json = tableService.dealTableReq(shopid);
		log.info("/getTables: handle finished");
		return callback+"("+json.toString()+")";
    }
	
	
}
