package com.smartmenu.controllers;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.smartmenu.entity.UserRightEnum;
import com.smartmenu.services.UserService;

@Controller
public class LoginController {
	@Autowired
	private UserService userService;
	
	private static Logger log = Logger.getLogger(LoginController.class);  
	
	@RequestMapping(value = "/action/loginByUserPwd", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doLoginByUserPwd(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, @RequestParam String userid, @RequestParam String password, 
    		@RequestParam String callback) throws IOException
    {
		log.info("/login(user&password): call login handler");
		JSONObject jsonResult;
		jsonResult = userService.checkUserAndRight(shopid, userid, password, UserRightEnum.LOGIN);
		log.info("/login(user&password): finished hanlding");
		return callback+"("+jsonResult.toString()+")";
    }

	@RequestMapping(value = "/action/loginByUser", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doLoginByUser(HttpServletResponse resp, @RequestParam String shopid, @RequestParam String userid, 
    		@RequestParam String callback) throws IOException
    {
		log.info("/login(user): call login handler");
		JSONObject jsonResult;
		jsonResult = userService.checkUserAndRight(shopid, userid, UserRightEnum.LOGIN);
		log.info("/login(user): finished hanlding");
		return callback+"("+jsonResult.toString()+")";
    }

	@RequestMapping(value = "/action/loginByCard", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doLoginByCard(HttpServletResponse resp, @RequestParam String mac, @RequestParam String shopid, @RequestParam String cardno, 
    		@RequestParam String callback) throws IOException
    {
		log.info("/login(card): call login handler");
		JSONObject jsonResult;
		jsonResult = userService.checkCardAndRight(shopid, cardno, UserRightEnum.LOGIN);
		log.info("/login(card): finished hanlding");
		return callback+"("+jsonResult.toString()+")";
    }
	
	@RequestMapping(value = "/action/checkUserPwd/{variable}", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doCheckRightByUserPwd(HttpServletResponse resp, @PathVariable String variable, @RequestParam String mac, @RequestParam String shopid, 
    		@RequestParam String userid, 
    		@RequestParam String password, 
            @RequestParam String callback) throws IOException
    {
		log.info("/check"+ variable +": call handler");
		JSONObject json;
		UserRightEnum userRight = getUserRight(variable);
		if( userRight!= null )
			json = userService.checkUserAndRight(shopid, userid, password, userRight);
		else{
			json = new JSONObject();
			json.put("status", 1);
			json.put("msg", "UNKNOWN_RIGHT");
		}
		log.info("/login: finished hanlding");
		return callback+"("+json.toString()+")";
    }

	@RequestMapping(value = "/action/checkUser/{variable}", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doCheckRightByUser(HttpServletResponse resp, @PathVariable String variable, @RequestParam String mac, @RequestParam String shopid,
    		@RequestParam String userid,  
            @RequestParam String callback) throws IOException
    {
		log.info("/check"+ variable +": call handler");
		JSONObject json;
		UserRightEnum userRight = getUserRight(variable);
		if( userRight!= null )
			json = userService.checkUserAndRight(shopid, userid, userRight);
		else{
			json = new JSONObject();
			json.put("status", 1);
			json.put("msg", "UNKNOWN_RIGHT");
		}
		log.info("/login: finished hanlding");
		return callback+"("+json.toString()+")";
    }
	
	@RequestMapping(value = "/action/checkCard/{variable}", method = RequestMethod.GET, produces=MediaType.APPLICATION_JSON_VALUE +";charset=UTF-8")
    public @ResponseBody
    String doCheckRightByCard(HttpServletResponse resp, @PathVariable String variable, @RequestParam String mac, @RequestParam String shopid,
    		@RequestParam String cardno,  
            @RequestParam String callback) throws IOException
    {
		log.info("/check"+ variable +": call handler");
		JSONObject json;
		UserRightEnum userRight = getUserRight(variable);
		if( userRight!= null )
			json = userService.checkCardAndRight(shopid, cardno, userRight);
		else{
			json = new JSONObject();
			json.put("status", 1);
			json.put("msg", "UNKNOWN_RIGHT");
		}
		log.info("/login: finished hanlding");
		return callback+"("+json.toString()+")";
    }
	
	
	private UserRightEnum getUserRight(String variable){
		UserRightEnum userRight;
		if(variable.equals("sendOrder"))
			userRight = UserRightEnum.SEND_ORDER;
		else if(variable.equals("changeTable"))
			userRight = UserRightEnum.CHANGE_TABLE;
		else if(variable.equals("deleteItem"))
			userRight = UserRightEnum.DELETE_ITEM;
		else if(variable.equals("changeCover"))
			userRight = UserRightEnum.CHANGE_COVER;
		else if(variable.equals("printCheck"))
			userRight = UserRightEnum.PRINT_CHECK;
		else{
			userRight = null;
		}
		return userRight;
	}
	
}
