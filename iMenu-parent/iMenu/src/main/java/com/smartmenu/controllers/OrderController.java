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

import com.smartmenu.services.OrderService;
import com.smartmenu.utils.CharsetUtils;

@Controller
public class OrderController {

	@Autowired
	private OrderService orderService;
	
	@RequestMapping(value = "/getOrder", method = RequestMethod.GET,produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doGetOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, @RequestParam String posid,
            @RequestParam String tableid, @RequestParam String callback) throws IOException
    {
		System.out.println("/getOrder: call order handler");
		JSONObject json = orderService.getOldOrder(shopid, tableid);
		System.out.println("/getOrder: handler finished");
		return callback+"("+json.toString()+")";
    }
	
	
	@RequestMapping(value = "/makeNewOrder", method = RequestMethod.GET,produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String makeNewOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {
		JSONObject json = JSONObject.fromObject(data);
		System.out.println("/makeNewOrder: call order handler deal the request");
		JSONObject jRet=orderService.makeNewOrder(json);
		System.out.println("/makeNewOrder: handle finished");
		return callback+"("+jRet.toString()+")";
    }
	//append to exist order 
	@RequestMapping(value = "/addToOrder", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String updateOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {
		JSONObject json = JSONObject.fromObject(data);
		System.out.println("/addToOrder: call order handler deal the request");
		JSONObject jRet=orderService.addToOrder(json);
		System.out.println("/addToOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	//delete item from an exist order
	@RequestMapping(value = "/deleteFromOrder", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String deleteFromOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {
		JSONObject json = JSONObject.fromObject(CharsetUtils.encodeStr(data));
		System.out.println("/deleteFromOrder: call order handler deal the request");
		JSONObject jRet=orderService.deleteFromOrder(json);
		System.out.println("/deleteFromOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	@RequestMapping(value = "/changeCover", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String changeCover(HttpServletResponse resp, @RequestParam String mac, 
    		@RequestParam String shopid, @RequestParam String posid,
    		@RequestParam String orderno, @RequestParam int cover,
    		@RequestParam String callback) throws IOException
    {
		System.out.println("/changeCover: call order handler deal the request");
		JSONObject jRet=orderService.dealChangeCover(shopid, orderno, cover);
		System.out.println("/changeCover: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	@RequestMapping(value = "/changeTable", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String changeTable(HttpServletResponse resp, @RequestParam String mac, 
    		@RequestParam String shopid, @RequestParam String posid,
    		@RequestParam String orderno, @RequestParam String newtable,
    		 @RequestParam String oldtable, @RequestParam String callback) throws IOException
    {
		System.out.println("/changeTable: call order handler deal the request");
		JSONObject jRet=orderService.dealChangeTable(shopid, orderno, newtable, oldtable);
		System.out.println("/changeTable: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	
	@RequestMapping(value = "/printOrder", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String printOrder(HttpServletResponse resp, @RequestParam String mac, 
    		@RequestParam String shopid, @RequestParam String posid,
    		@RequestParam String orderno, @RequestParam String callback) throws IOException
    {
		System.out.println("/printOrder: call order handler deal the request");
		JSONObject jRet=orderService.dealReqPrintOrder(shopid, orderno);
		System.out.println("/printOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
}
