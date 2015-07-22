package com.smartmenu.utils;

import java.io.UnsupportedEncodingException;

public class CharsetUtils {
	public static final String CHARSET_UTF_8 = "UTF-8";
	
	public static String encodeStr(String str) {
		try {
			return new String(str.getBytes("ISO-8859-1"), "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return null;
		}
	}
}
