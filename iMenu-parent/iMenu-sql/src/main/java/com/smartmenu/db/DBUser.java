package com.smartmenu.db;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.smartmenu.entity.User;
import com.smartmenu.entity.UserRightEnum;

@Component
public class DBUser{
	private static Logger log = Logger.getLogger(DBUser.class);
	
	@Autowired
	private DBCommonUtil dbCommonUtil;
	public static int PASS_CHECK=0;
	public static int USER_DISABLE=1;
	public static int USER_NOT_EXIST=2;
	public static int NO_RIGHT=3;
	//
	private User getUserInfoByUserId(String shopId, String userId){
		String condition = " WHERE user_id='" +userId + "' and shop_id='" + shopId + "'";
		return getUserInfo(condition);
	}
	
	private User getUserInfoByUserId(String shopId, String userId, String password){
		String condition = " WHERE user_id='" +userId + "' and password='" + password + "' and shop_id='" + shopId + "'";
		return getUserInfo(condition);
	}
	
	private User getUserInfoByCard(String shopId, String cardNo){
		String condition = " WHERE card_no='" + cardNo + "' and shop_id='" + shopId + "'";
		return getUserInfo(condition);
	}
	
	//get valid user info on the condition
	private User getUserInfo(String condition){
		String sql="SELECT [user_id], [password], [group_id], [name1], [name2], [effective_date], [expiry_date], [enable] FROM [dbo].[user] " + condition ;
		log.info("GetUser: " + sql);
		List<Object> lsUsers = dbCommonUtil.query(sql, new ParseResultSetInterface(){
			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				while(rs.next()){
			    	User user = new User();
			    	user.setUserId(rs.getString("user_id"));
			    	user.setUserName(rs.getString("name1"));
			    	user.setUserName2(rs.getString("name2"));
			    	user.setPassword(rs.getString("password"));
			    	user.setGroupId(rs.getString("group_id"));
			    	user.setEffectiveDate(rs.getDate("effective_date"));
			    	user.setExpiryDate(rs.getDate("expiry_date"));
			    	user.setEnable(rs.getInt("enable"));
			    	ls.add(user);	    	
			    }
				if(ls.size()==0)
					return null;
				else
					return ls;
			}
			
		});
		if(lsUsers==null||lsUsers.size()==0)
			return null;
		return (User)lsUsers.get(0);
	}
		
	public String[] getRights(String shopId, String groupId){
		String sql="select [function] from [dbo].[user_rights] where id_type=2 and rights1=1 and id='"+groupId+"' and shop_id='"+shopId+"'";
		log.info("GetUserRight:" + sql);
		List<Object> ls=dbCommonUtil.query(sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				while(rs.next()){
					String right = rs.getString("function");
					ls.add(right);
				}
				if(ls.size()==0)
					return null;
				else
					return ls;
			}
			
		});
		if(ls==null||ls.size()==0)
			return null;
		String[] array = ls.toArray(new String[]{});
		return array;
	}
	
	private int checkRight(String shopId, User user, UserRightEnum right){
		String rightStr;
		if(right == UserRightEnum.LOGIN)
			rightStr = "00001";
		else if(right == UserRightEnum.SEND_ORDER)
			rightStr = "00002";
		else if(right == UserRightEnum.CHANGE_TABLE)
			rightStr = "00023";
		else if(right == UserRightEnum.DELETE_ITEM)
			rightStr = "00032";
		else if(right == UserRightEnum.CHANGE_COVER)
			rightStr = "00014";
		else if(right == UserRightEnum.PRINT_CHECK)
			rightStr = "00016";
		else 
			rightStr = "UNKNOWN";
		String[] rights = this.getRights(shopId, user.getGroupId());
		for(String str : rights){
			if(str!=null && str.equals(rightStr))
				return PASS_CHECK;
		}
		return NO_RIGHT;
	}
	
	//check if the user exists and enable.
	private int checkUser(User user){
		if(user == null)
			return USER_NOT_EXIST;
		if(user.getEnable()!=1)
			return USER_DISABLE;
		long currTime=System.currentTimeMillis();
		if(user.getEffectiveDate()!=null&&user.getEffectiveDate().getTime()>currTime){
			return USER_DISABLE;
		}
		if(user.getExpiryDate()!=null&&user.getExpiryDate().getTime()<currTime){
			return USER_DISABLE;
		}
		return PASS_CHECK;
	}
	
	//check if userid and password is correct and has the right
	public int checkUserByUserId(String shopId, String userId, String password, UserRightEnum right){
		User user = this.getUserInfoByUserId(shopId, userId, password);
		int result = checkUser(user);
		if(result == PASS_CHECK)
			return checkRight(shopId, user, right);
		else
			return result;
	}
	//
	public int checkUserByUserId(String shopId, String userId, UserRightEnum right){
		User user = this.getUserInfoByUserId(shopId, userId);
		int result = checkUser(user);
		if(result == PASS_CHECK)
			return checkRight(shopId, user, right);
		else
			return result;
	}
	//
	public int checkUserByCard(String shopId, String cardNo, UserRightEnum right){
		User user = this.getUserInfoByCard(shopId, cardNo);
		int result = checkUser(user);
		if(result == PASS_CHECK)
			return checkRight(shopId, user, right);
		else
			return result;
	}
	
	
}
