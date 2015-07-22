package com.smartmenu.services;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartmenu.db.DBUser;
import com.smartmenu.entity.UserRightEnum;
import com.smartmenu.utils.ReturnMsgCode;

@Service
public class UserService {
	@Autowired
	private DBUser dbUser;
	
	public JSONObject checkUserAndRight(String shopId, String userId, String password, UserRightEnum right){
		JSONObject json = new JSONObject();
		String msg;
		int status;
		System.out.println(this.getClass().getName()+": check user login right");
		int result = dbUser.checkUserByUserId(shopId, userId, password, UserRightEnum.LOGIN);
		if(result == DBUser.USER_NOT_EXIST || result == DBUser.USER_DISABLE){
			System.out.println();
			status = 1;
			msg = ReturnMsgCode.USER_ERROR;
			System.out.println(this.getClass().getName()+": user is valid.");
		}else if(result == DBUser.NO_RIGHT){
			status = 1;
			msg = ReturnMsgCode.AUTHORITY_ERROR;
			System.out.println(this.getClass().getName()+": no right.");
		}else{
			status = 0;
			msg = ReturnMsgCode.SUCCESS;
			System.out.println(this.getClass().getName()+": user right check passed.");
		}
		json.put("status", status);
		json.put("msg", msg);
		return json;
	}

	public JSONObject checkUserAndRight(String shopId, String userId, UserRightEnum right){
		JSONObject json = new JSONObject();
		JSONArray jaMsg = new JSONArray();
		int status;
		System.out.println(this.getClass().getName()+": check user login right");
		int result = dbUser.checkUserByUserId(shopId, userId, UserRightEnum.LOGIN);
		if(result == DBUser.USER_NOT_EXIST || result == DBUser.USER_DISABLE){
			System.out.println();
			status = 1;
			jaMsg.add("USER_ERROR");
			System.out.println(this.getClass().getName()+": user doesn't exist.");
		}else if(result == DBUser.NO_RIGHT){
			status = 1;
			jaMsg.add("AUTHORITY_ERROR");
			System.out.println(this.getClass().getName()+": no right.");
		}else{
			status = 0;
			jaMsg.add("SUCCESS");
			System.out.println(this.getClass().getName()+": user right check passed.");
		}
		json.put("status", status);
		json.put("msg", jaMsg);
		return json;
	}
	
	public JSONObject checkCardAndRight(String shopId, String cardNo, UserRightEnum right){
		JSONObject json = new JSONObject();
		JSONArray jaMsg = new JSONArray();
		int status;
		System.out.println(this.getClass().getName()+": check user login right");
		int result = dbUser.checkUserByCard(shopId, cardNo, right);
		if(result == DBUser.USER_NOT_EXIST || result == DBUser.USER_DISABLE){
			System.out.println();
			status = 1;
			jaMsg.add("USER_ERROR");
			System.out.println(this.getClass().getName()+": user doesn't exist.");
		}else if(result == DBUser.NO_RIGHT){
			status = 1;
			jaMsg.add("AUTHORITY_ERROR");
			System.out.println(this.getClass().getName()+": no right.");
		}else{
			status = 0;
			jaMsg.add("SUCCESS");
			System.out.println(this.getClass().getName()+": user right check passed.");
		}
		json.put("status", status);
		json.put("msg", jaMsg);
		return json;
	}
}
