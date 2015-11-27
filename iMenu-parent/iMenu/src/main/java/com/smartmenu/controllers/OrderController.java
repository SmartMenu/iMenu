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

import com.smartmenu.services.OrderService;

@Controller
public class OrderController {
	private static Logger log = Logger.getLogger(OrderController.class);
	@Autowired
	private OrderService orderService;
	
	@RequestMapping(value = "/action/getOrder", method = RequestMethod.GET,produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doGetOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, @RequestParam String posid,
            @RequestParam String tableid, @RequestParam String callback) throws IOException
    {
		log.info("/getOrder: call order handler");
		JSONObject json = orderService.getOldOrder(shopid, tableid);
		log.info("/getOrder: handler finished");
		return callback+"("+json.toString()+")";
    }
	
	
	@RequestMapping(value = "/action/makeNewOrder", method = RequestMethod.GET,produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String makeNewOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {

		JSONObject json = JSONObject.fromObject(data);
		log.info("/makeNewOrder: call order handler deal the request");
		JSONObject jRet=orderService.makeNewOrder(json);
		log.info("/makeNewOrder: handle finished");
		return callback+"("+jRet.toString()+")";
    }
	@RequestMapping(value = "/action/makeNewOrder", method = RequestMethod.POST,produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String makeNewOrder2(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {

		JSONObject json = JSONObject.fromObject(data);
		log.info("/makeNewOrder: call order handler deal the request");
		JSONObject jRet=orderService.makeNewOrder(json);
		log.info("/makeNewOrder: handle finished");
		return callback+"("+jRet.toString()+")";
    }
	
	//append to exist order 
	@RequestMapping(value = "/action/addToOrder", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String updateOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {
		JSONObject json = JSONObject.fromObject(data);
		log.info("/addToOrder: call order handler deal the request");
		JSONObject jRet=orderService.addToOrder(json);
		log.info("/addToOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	@RequestMapping(value = "/action/addToOrder", method = RequestMethod.POST, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String updateOrder2(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {
		JSONObject json = JSONObject.fromObject(data);
		log.info("/addToOrder: call order handler deal the request");
		JSONObject jRet=orderService.addToOrder(json);
		log.info("/addToOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	//delete item from an exist order
	@RequestMapping(value = "/action/deleteFromOrder", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String deleteFromOrder(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {
		//JSONObject json = JSONObject.fromObject(CharsetUtils.encodeStr(data));
		JSONObject json = JSONObject.fromObject(data);
		log.info("/deleteFromOrder: call order handler deal the request");
		JSONObject jRet=orderService.deleteFromOrder(json);
		log.info("/deleteFromOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	@RequestMapping(value = "/action/deleteFromOrder", method = RequestMethod.POST, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String deleteFromOrder2(HttpServletResponse resp, @RequestParam String mac, @RequestParam String data,
    		@RequestParam String callback) throws IOException
    {
		//JSONObject json = JSONObject.fromObject(CharsetUtils.encodeStr(data));
		JSONObject json = JSONObject.fromObject(data);
		log.info("/deleteFromOrder: call order handler deal the request");
		JSONObject jRet=orderService.deleteFromOrder(json);
		log.info("/deleteFromOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	@RequestMapping(value = "/action/changeCover", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String changeCover(HttpServletResponse resp, @RequestParam String mac, 
    		@RequestParam String shopid, @RequestParam String posid,
    		@RequestParam String orderno, @RequestParam int cover,
    		@RequestParam String callback) throws IOException
    {
		log.info("/changeCover: call order handler deal the request");
		JSONObject jRet=orderService.dealChangeCover(shopid, orderno, cover);
		log.info("/changeCover: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	@RequestMapping(value = "/action/changeTable", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String changeTable(HttpServletResponse resp, @RequestParam String mac, 
    		@RequestParam String shopid, @RequestParam String posid,
    		@RequestParam String orderno, @RequestParam String newtable,
    		 @RequestParam String oldtable, @RequestParam String callback) throws IOException
    {
		log.info("/changeTable: call order handler deal the request");
		JSONObject jRet=orderService.dealChangeTable(shopid, orderno, newtable, oldtable);
		log.info("/changeTable: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
	
	@RequestMapping(value = "/action/printOrder", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String printOrder(HttpServletResponse resp, @RequestParam String mac, 
    		@RequestParam String shopid, @RequestParam String posid,
    		@RequestParam String orderno, @RequestParam String callback) throws IOException
    {
		log.info("/printOrder: call order handler deal the request");
		JSONObject jRet=orderService.dealReqPrintOrder(mac, shopid, orderno);
		log.info("/printOrder: handler finished");
		return callback+"("+jRet.toString()+")";
    }
	
}
