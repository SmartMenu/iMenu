package com.smartmenu.utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
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
import java.text.SimpleDateFormat;
import java.util.Calendar;

import javax.crypto.Cipher;

import org.apache.log4j.Logger;

import com.smartmenu.controllers.OrderController;

public class SmartCheck {
	private static Logger log = Logger.getLogger(SmartCheck.class);
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

	private String getUserDataDirectory()
	{
		String imenuUserFolder = null;
	    String OS = System.getProperty("os.name").toUpperCase();
	    if (OS.contains("WIN"))
	        imenuUserFolder = System.getenv("APPDATA");
	    else if (OS.contains("MAC"))
	        imenuUserFolder = System.getProperty("user.home") + File.separator + "Library"
	                          +File.separator + "Application Support";
	    else if (OS.contains("NUX")){
	    	String folder = System.getenv("XDG_DATA_HOME");
	    	String userHome = System.getProperty("user.home"); 
	    	if (folder == null) {
	    		folder = userHome + File.separator + ".local" + File.separator + "share";
	    	}
	    	imenuUserFolder = folder;
		}
	    else		        
			imenuUserFolder = System.getProperty("user.dir");
	    
	    return imenuUserFolder + File.separator + "iData" + File.separator;
	}
	
	//record first use time
	public void takedownFirstUse(long time,String licenseID){
		String path = this.getUserDataDirectory();
		File dir = new File(path);
		if(!dir.isDirectory())
			dir.mkdirs();
		File file = new File(path+fTime);
		if(file.exists()){
			file.delete();
		}
		BufferedWriter bufferWritter = null;
		FileWriter fileWritter = null;
		try {
			file.createNewFile();
			fileWritter = new FileWriter(file,false);
            bufferWritter = new BufferedWriter(fileWritter);
            bufferWritter.write(time+","+licenseID);
            
		} catch (IOException e) {
			e.printStackTrace();
		} finally{
			try{
					if(bufferWritter != null){
						bufferWritter.flush();
						bufferWritter.close();
					}
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			try{
				if(fileWritter!=null)
					fileWritter.close();
			}catch(IOException e){
				e.printStackTrace();
			}
		}
		
	}
	//get first use time
	public long getFirstUseTime(){
		String path = this.getUserDataDirectory();
		File file = new File(path+fTime);
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
		String path = this.getUserDataDirectory();
		File file = new File(path+fTime);
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
	//check license, 
	public boolean checkLicense(){
		Key key = readKey();
		if(key == null){
			log.info("License[ERROR]: public.key file is missed.");
			return false;
		}
		byte[] input = readData();
		if(input == null){
			log.info("License[ERROR]: shop.lic file is missed.");
			return false;
		}
		String[] data = publicDecrypt(key, input);
		if(data == null){
			log.info("License[ERROR]: the license file shop.lic can't be decrypted.");
			return false;
		}
		String oldLicenseID = this.getLicenseID();
		if(oldLicenseID==null){
			log.info("License[INFO]: License ID is "+data[0]+"(for the first use).");
			this.takedownFirstUse(System.currentTimeMillis(),data[0]);
		}else if(!oldLicenseID.equals(data[0])){
			log.info("License[INFO]: License ID is " + data[0] + "(new, the old is "+oldLicenseID+").");
			this.takedownFirstUse(System.currentTimeMillis(),data[0]);
		}else{
			log.info("License[INFO]: License ID is " + data[0]);
		}
//		if(oldLicenseID==null||!oldLicenseID.equals(data[0])){
//			log.info("License[INFO]: a new license file.");
//			this.takedownFirstUse(System.currentTimeMillis(),data[0]);
//		}
		if(!data[1].equals("null")){
			String localMac = getLocalMac();
			if(!localMac.equalsIgnoreCase(data[1])){
				log.info("License[INFO]: License Mac Address("+data[1]+") can't match the server mac address("+localMac+"). ");
				return false;
			}
		}
		log.info("License[INFO]: the Shop is " + data[2]);
		this.connector = Integer.parseInt(data[3]); 
		log.info("License[INFO]: max connection " + this.connector);
		long firstTime = getFirstUseTime();
		if(firstTime == -1){
			log.info("License[ERROR]: System config file is missed.");
			return false;
		}
		Calendar caEnd = Calendar.getInstance();
		caEnd.setTimeInMillis(firstTime);
		caEnd.add(Calendar.MONTH, Integer.parseInt(data[4]));
		this.endtime = caEnd.getTimeInMillis();
		long currentTime = System.currentTimeMillis();
		SimpleDateFormat sm = new SimpleDateFormat("yyyy-MM-dd");
		System.out.print("License[INFO]: Valid date up to "+sm.format(caEnd.getTime()));
		if(currentTime<firstTime|| currentTime>caEnd.getTimeInMillis()){
			Calendar caBegin = Calendar.getInstance();
			caBegin.setTimeInMillis(currentTime);
			log.info("(fail, current date is )"+sm.format(caBegin.getTime()));
			return false;
		}
		log.info("(pass).");
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
			log.info("GET MAC ADDRESS ERROR");
		}
		
		return null;
	}
	
	private Key readKey(){
		URL path = SmartCheck.class.getResource("/public.key");
		File keyFile = new File(path.getFile());
		log.debug(keyFile.getAbsolutePath());
		if(keyFile.exists())
			log.debug("public.key exists" );
		try {
			FileInputStream fiskey = new FileInputStream(keyFile);
			ObjectInputStream oiskey=new ObjectInputStream(fiskey);  
	        Key key=(Key)oiskey.readObject();  
	        oiskey.close();  
	        fiskey.close();  
	        return key; 
		} catch (FileNotFoundException e) {
			log.info(e.getMessage());
		} catch (IOException e) {
			log.info(e.getMessage());
		} catch (ClassNotFoundException e) {
			log.info(e.getMessage());
		}  
	    log.info("读取Key文件失败.");
        return null;
	}
	private byte[] readData(){ 
		URL path = SmartCheck.class.getResource("/shop.lic");
		File fLicense = new File(path.getFile());
		log.debug("License Path: " + fLicense.getAbsolutePath());
		if(fLicense.exists())
			log.debug("License file exists");
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
			log.info(e.getMessage());
		}
		log.info("读取License文件失败.");
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
	        	log.info("License解析失败。");
	        	return null;
	        }

		} catch(Exception e){
			e.printStackTrace();
		}
		log.info("License解析失败。");
		return null;
	}
	
}
