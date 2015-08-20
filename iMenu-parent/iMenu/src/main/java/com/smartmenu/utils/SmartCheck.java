package com.smartmenu.utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.URL;
import java.security.Key;
import java.util.Calendar;

import javax.crypto.Cipher;

public class SmartCheck {
	private static SmartCheck checker = new SmartCheck();
	private String fTime="y65042PAEegha";
	
	private long endtime=-1;
	private int connector=-1;
	
	public long getEndtime() {
		return endtime;
	}

	public int getConnector() {
		return connector;
	}

	private SmartCheck(){}
	
	public static SmartCheck getInstanse(){
		return checker;
	}
	//record first use time
	public void takedownFirstUse(long time,String licenseID){
		URL path = SmartCheck.class.getResource("/");
		File file = new File(path.getPath()+fTime);
		if(file.exists()){
			file.delete();
		}
		try {
			file.createNewFile();
			FileWriter fileWritter = new FileWriter(file,true);
             BufferedWriter bufferWritter = new BufferedWriter(fileWritter);
             bufferWritter.write(time+","+licenseID);
             bufferWritter.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
	}
	//get first use time
	public long getFirstUseTime(){
		URL path = SmartCheck.class.getResource("/");
		File file = new File(path.getPath()+fTime);
		if(file.exists()){
			try {
				BufferedReader br = new BufferedReader(new FileReader(file));
				String line = br.readLine();
				if(line != null&&line.contains(",")){
					String strTime = line.split(",")[0].trim();
					return Long.parseLong(strTime);
				}
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return -1;
	}
	public String getLicenseID(){
		URL path = SmartCheck.class.getResource("/");
		File file = new File(path.getPath()+fTime);
		if(file.exists()){
			try {
				BufferedReader br = new BufferedReader(new FileReader(file));
				String line = br.readLine();
				if(line != null&&line.contains(","))
					return line.split(",")[1];
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return null;
		
	}
	//check license, return max connections
	public boolean checkLicense(){
		Key key = readKey();
		byte[] input = readData();
		if(key == null || input == null)
			return false;
		String[] data = publicDecrypt(key, input);
		if(data == null)
			return false;
		String oldLicenseID = this.getLicenseID();
		if(oldLicenseID==null||!oldLicenseID.equals(data[0])){
			this.takedownFirstUse(System.currentTimeMillis(),data[0]);
		}
		if(!data[1].equals("null")){
			String localMac = getLocalMac();
			if(!localMac.equalsIgnoreCase(data[1]))
				return false;
		}
		this.connector = Integer.parseInt(data[3]); 
		long firstTime = getFirstUseTime();
		if(firstTime == -1){
			return false;
		}
		Calendar caEnd = Calendar.getInstance();
		caEnd.setTimeInMillis(firstTime);
		caEnd.add(Calendar.MONTH, Integer.parseInt(data[4]));
		this.endtime = caEnd.getTimeInMillis();
		long currentTime = System.currentTimeMillis();
		if(currentTime<firstTime|| currentTime>caEnd.getTimeInMillis()){
			return false;
		}
		
		return true;
	}
	private String getLocalMac() {
		try{
			byte[] mac = NetworkInterface.getByInetAddress(InetAddress.getLocalHost()).getHardwareAddress();
			
			StringBuffer sb = new StringBuffer("");
			for(int i=0; i<mac.length; i++) {
				if(i!=0) {
					sb.append("-");
				}
				//byte to integer
				int temp = mac[i]&0xff;
				String str = Integer.toHexString(temp);
				
				if(str.length()==1) {
					sb.append("0"+str);
				}else {
					sb.append(str);
				}
			}
			return sb.toString().toUpperCase();
		}catch (Exception ex){
			//get mac address error
			System.out.println("GET MAC ADDRESS ERROR");
		}
		
		return null;
	}
	
	private Key readKey(){
		URL path = SmartCheck.class.getResource("/public.key");
		File keyFile = new File(path.getFile());
		try {
			FileInputStream fiskey = new FileInputStream(keyFile.getAbsolutePath());
			ObjectInputStream oiskey=new ObjectInputStream(fiskey);  
	        Key key=(Key)oiskey.readObject();  
	        oiskey.close();  
	        fiskey.close();  
	        return key; 
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}  
	    System.out.println("读取Key文件失败.");
        return null;
	}
	private byte[] readData(){ 
		URL path = SmartCheck.class.getResource("/shop.lic");
		File fLicense = new File(path.getFile());
		try {
			FileInputStream fisDat = new FileInputStream(fLicense.getAbsolutePath());

			//
			ByteArrayOutputStream arrayOutputStream = new ByteArrayOutputStream();
			int len = 0;
			byte[] data = new byte[1024];
			while ((len = fisDat.read(data)) != -1) {
				arrayOutputStream.write(data, 0, len);
			}
			byte[] result = arrayOutputStream.toByteArray();
			arrayOutputStream.close();

			fisDat.close();
			return result;
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println("读取License文件失败.");
		return null;
          
    } 
	private String[] publicDecrypt(Key key, byte[] data){
		try{
			int formatFlag = 0;
			String result[] = new String[5];
			Cipher cipher=Cipher.getInstance("RSA");  
	        cipher.init(Cipher.DECRYPT_MODE, key);
	        String temp = new String(cipher.doFinal(data),"UTF-8");
	        if(temp.contains("&")){
	        	String strs[] = temp.split("&");
	        	
	        	if(strs.length == 5){
	        		if(strs[0].contains("licenseID")&&strs[0].contains("="))
	        			result[0] = strs[0].split("=")[1];
	        		if(strs[1].contains("mac")&&strs[1].contains("="))
	        			result[1] = strs[1].split("=")[1];
	        		else
	        			formatFlag = -1;
	        		if(strs[2].contains("shop")&&strs[2].contains("="))
	        			result[2] = strs[2].split("=")[1];
	        		else
	        			formatFlag = -1;
	        		if(strs[3].contains("connector")&&strs[3].contains("=")){
	        			String strConn = strs[3].split("=")[1];
	        			try{
	        				int iTmp = Integer.parseInt(strConn);
	        				result[3] = strConn;
	        			}catch(Exception e){
	        				formatFlag = -1;	        				
	        			}
	        		}else
	        			formatFlag = -1;
	        		if(strs[4].contains("month")&&strs[4].contains("=")){
	        			String strMonth = strs[4].split("=")[1];
	        			try{
	        				int iTmp = Integer.parseInt(strMonth);
	        				result[4] = strMonth;
	        			}catch(Exception e){
	        				formatFlag = -1;
	        			}
	        		}
	        		
	        	}else
	        		formatFlag = -1;
	        }else
	        	formatFlag = -1;
	        if(formatFlag == 0)
	        	return result;
	        else{
	        	System.out.println("License解析失败。");
	        	return null;
	        }

		} catch(Exception e){
			e.printStackTrace();
		}
		System.out.println("License解析失败。");
		return null;
	}
	
}
