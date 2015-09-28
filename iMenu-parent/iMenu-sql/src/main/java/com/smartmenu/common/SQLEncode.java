package com.smartmenu.common;

public class SQLEncode {
	public static String encode(String str){
		String result = str.replaceAll("'", "''");
		return result;
	}
}
