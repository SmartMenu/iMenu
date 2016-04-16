package com.smartmenu.services;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartmenu.common.PrintProperty;
import com.smartmenu.controllers.OrderController;
import com.smartmenu.entity.Order;

@Service
public class PrinterService {
	private static Logger log = Logger.getLogger(PrinterService.class);
	@Autowired
	private PrintProperty printProperty;
	
	public boolean printListForKitchen(Order order){
		return generatePrintFile(order, "01");
	}
	
	public boolean printListForCustomer(Order order){
		return generatePrintFile(order, "02");
	}
	
	//fn_code=01 for customer; fn_code=02 for kitchen
	private boolean generatePrintFile(Order order, String fn_code) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		StringBuffer content = new StringBuffer();
		
		content.append(fn_code + ","); // FN_CODE
		content.append(order.getShopId() + ",");// SHOP_ID
		content.append(order.getPosId() + ",");// POS_ID
		content.append(order.getTableId() + ",");// TABLE_NO
		
		if(fn_code.equals("01")){
			content.append(order.getTranNo() + ",");// TRAN_NO
			content.append(order.getCheckNo() + ",");// CHECK_NO
			content.append(sdf.format(order.getTranDate()) + ",");// TRAN_DATE
			content.append(sdf.format(order.getCheckDate()) + ",");// CHECK_DATE
		}

		content.append(order.getUserId());// USER_ID

		if (printProperty == null || printProperty.getFolder() == null) {
			System.out
					.println("Error: Sending check is refused because of print folder not configed.");
		} else {
			SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMddHHmmssSSS");
			String filePath = printProperty.getFolder()
					+ sdf1.format(new Date()) + "_" + printProperty.getSeq()
					+ ".txt";
			log.info("PrintFile: " + filePath);
			File file = new File(filePath);
			FileWriter fw = null;
			try {
				if (!file.exists())
					file.createNewFile();
				fw = new FileWriter(file);
				fw.write(content.toString());
				return true;
			} catch (IOException e) {
				log.info("ERROR: write print check file failed");
				e.printStackTrace();
			} finally {
				if (fw != null)
					try {
						fw.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
			}
		}
		return false;
	}
	
}
