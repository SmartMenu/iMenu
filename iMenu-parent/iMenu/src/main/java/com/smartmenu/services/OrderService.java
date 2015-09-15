
package com.smartmenu.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartmenu.db.DBOrder;
import com.smartmenu.db.DBTable;
import com.smartmenu.entity.Discount;
import com.smartmenu.entity.Order;
import com.smartmenu.entity.OrderDetail;
import com.smartmenu.entity.ServiceCharge;
import com.smartmenu.entity.Tax;
import com.smartmenu.utils.ReturnMsgCode;

@Service
public class OrderService {
	
	@Autowired
	private DBOrder dbOrder;
	@Autowired 
	private PrinterService printer;
	
	@Autowired
	private DBTable dbTable;
	
	public JSONObject makeNewOrder(JSONObject data){
		JSONObject json = new JSONObject();
		int status=0;
		String msg;
	
		JSONObject jOrder=data.getJSONObject("order");
		JSONArray jaDetail=data.getJSONArray("details");
		Order order = this.parseOrder(jOrder);
		List<OrderDetail> lsOrderDetail = this.parseDetails(jaDetail);
		if(order==null||lsOrderDetail==null){
			status=1;
			msg = ReturnMsgCode.LACK_OF_INFO;
		}else{
			
			String result = dbOrder.addNewOrder(order, lsOrderDetail);
			if(result.equals("SUCCESS")){
				Order newOrder = dbOrder.getOrder(order.getShopId(), order.getTranNo());
				boolean bl = printer.printListForKitchen(newOrder);
				if(bl){
					System.out.println("SUCCESS");
					status=0;
					msg = ReturnMsgCode.SUCCESS;
				}else{
					System.out.println("Printer list for kitchen failed.");
					status = 1;
					msg = ReturnMsgCode.PRINT_ERROR;
				}
				
			}else{
				status=1;
				System.out.println(result);
				msg = ReturnMsgCode.DATA_ERROR;
			}
			
		}
		json.put("status", status);
		json.put("msg", msg);
		return json;
	}
	public JSONObject getOldOrder(String shopId, String tableId){
		JSONObject json=new JSONObject();
		//JSONArray jaMsg=new JSONArray();
		JSONObject jData=new JSONObject();
		int status=0;
		Order order=dbOrder.getExistOrder(shopId, tableId);
		if(order==null){
			status=0;
			json.put("status", status);
			json.put("msg", ReturnMsgCode.DATA_IS_NULL);
			json.put("data", jData);
			return json;
		}
		OrderDetail[] orderDetails=dbOrder.getOrderDetail(shopId, order.getTranNo());
		if(orderDetails==null || orderDetails.length==0){
			status=0;
			json.put("status", status);
			json.put("msg", ReturnMsgCode.DATA_IS_NULL);
			json.put("data", jData);
			return json;
		}
		jData.put("order-no", order.getTranNo());
		jData.put("check-no", order.getCheckNo());
	
		JSONArray jaDetails = new JSONArray();
		for(OrderDetail orderDetail: orderDetails){
			JSONObject jDetail = new JSONObject();
			jDetail.put("item-id", orderDetail.getItemId());
			jDetail.put("item-name", orderDetail.getDesc());
			jDetail.put("item-name2", orderDetail.getDesc2());
			jDetail.put("seq", orderDetail.getSeqNo());
			jDetail.put("qty", orderDetail.getQty());
			jDetail.put("price", orderDetail.getPrice());
			jDetail.put("cat-id", orderDetail.getCatId());
			jDetail.put("cat-name", orderDetail.getCatName());
			jDetail.put("cat-name2", orderDetail.getCatName2());
			jDetail.put("disc-able", orderDetail.getDiscAble());
			jDetail.put("svchg-able", orderDetail.getSvchgAble());
			jDetail.put("tax-able", orderDetail.getTaxAble());
			jDetail.put("subtype", orderDetail.getSubtype());
			jDetail.put("is-modifier", orderDetail.getIsModifier());
			jDetail.put("link-row", orderDetail.getLinkRow());
			jDetail.put("modifier-value", orderDetail.getModifierValue());
			jaDetails.add(jDetail);
		}
		jData.put("details", jaDetails);
		json.put("status", status);
		json.put("msg", ReturnMsgCode.SUCCESS);
		json.put("data", jData);
		return json;
	}
	
	public JSONObject addToOrder(JSONObject data){
		JSONObject json = new JSONObject();
		
		int status=0;
		String msg;
		
		JSONObject jOrder=data.getJSONObject("order");
		JSONArray jaDetail=data.getJSONArray("details");
		Order order = this.parseOrder(jOrder);
		List<OrderDetail> lsNewOrderDetail = this.parseDetails(jaDetail);
		if(order==null||lsNewOrderDetail==null){
			status=1;
			msg = ReturnMsgCode.LACK_OF_INFO;
		}else{
			String result = dbOrder.appendExistOrder(order, lsNewOrderDetail);
			if(result.equals("SUCCESS")){
				Order newOrder = dbOrder.getOrder(order.getShopId(), order.getTranNo());
				boolean bl = printer.printListForKitchen(newOrder);
				if(bl){
					System.out.println("SUCCESS");
					status=0;
					msg = ReturnMsgCode.SUCCESS;
				}else{
					System.out.println("Printer list for kitchen failed.");
					status = 1;
					msg = ReturnMsgCode.PRINT_ERROR;
				}
				
			}else{
				status=1;
				System.out.println(result);
				msg = ReturnMsgCode.DATA_ERROR;
			}
			
		}
		json.put("status", status);
		json.put("msg", msg);
		return json;
	}
	
	public JSONObject deleteFromOrder(JSONObject data){
		JSONObject json = new JSONObject();
		
		int status=0;
		String msg;
		
		JSONObject jOrder=data.getJSONObject("order");
		JSONArray jaDetail=data.getJSONArray("details");
		Order order = this.parseOrder(jOrder);
		List<OrderDetail> lsDeleteOrderDetail = this.parseDetails(jaDetail);
		if(order==null||lsDeleteOrderDetail==null){
			status=1;
			msg = ReturnMsgCode.LACK_OF_INFO;
		}else{
			String result = dbOrder.deleteFromExistOrder(order, lsDeleteOrderDetail);
			if(result.equals("SUCCESS")){
				Order newOrder = dbOrder.getOrder(order.getShopId(), order.getTranNo());
				boolean bl = printer.printListForKitchen(newOrder);
				if(bl){
					System.out.println("SUCCESS");
					status=0;
					msg = ReturnMsgCode.SUCCESS;
				}else{
					System.out.println("Printer list for kitchen failed.");
					status = 1;
					msg = ReturnMsgCode.PRINT_ERROR;
				}
				
			}else{
				status=1;
				System.out.println(result);
				msg = ReturnMsgCode.DATA_ERROR;
			}
			
		}
		json.put("status", status);
		json.put("msg", msg);
		return json;
	}
/*
"order":{"shop-id": "","pos-id":"","table-id":"", "order-no": "",  ///////////"order-date":"",
"cover": ,
"service-charge":{"id":,"desc":"","desc2":"","value":, "type":},"service-charge-amount":,
"tax":{"id":"","value":},"tax-amount":,
"discount":{"id":"","disc-type":,"rate":,"desc":"","desc2":""},"discount-amount":,
"subtotal-amount":,"total-amount":,"user-id":""
"delete-reason":{"reason-code":, "reason-desc":, "reason-desc2":}}
 * */	
	private Order parseOrder(JSONObject jOrder){
		int status=0;
		Order order = new Order();
		String shopId = jOrder.getString("shop-id");
		if(shopId==null||shopId.trim().length()==0)
		{
			System.out.println("shop id can't be null");
			status=1;
		}else
			order.setShopId(shopId);
		String posId=jOrder.getString("pos-id");
		if(posId==null||posId.trim().length()==0)
		{
			System.out.println("pos id can't be null");
			status=1;
		}else
			order.setPosId(posId);
		String tableId = jOrder.getString("table-id");
		if(tableId==null||tableId.trim().length()==0){
			System.out.println("table id can't be null");
			status=1;
		}else
			order.setTableId(tableId);
		
		String sectionId = dbTable.getSectionId(shopId, tableId);
		if(sectionId==null){
			order.setSectionId("");
		}else
			order.setSectionId(sectionId);
		if(jOrder.containsKey("order-no")){
			String tranNo=jOrder.getString("order-no");
			if(tranNo==null||tranNo.trim().length()==0)
				order.setTranNo(null);
			else
				order.setTranNo(tranNo);
		}else
			order.setTranNo(null);
		
		if(jOrder.containsKey("check-no")){
			String checkNo=jOrder.getString("check-no");
			if(checkNo==null||checkNo.trim().length()==0)
				order.setCheckNo(null);
			else
				order.setCheckNo(checkNo);
		}else
			order.setCheckNo(null);		
		
		if(jOrder.containsKey("cover")&&jOrder.getString("cover")!=""){
			int cover = jOrder.getInt("cover");
			order.setCover(cover);
		}

		if(jOrder.containsKey("service-charge")){
			JSONObject svchg=jOrder.getJSONObject("service-charge");
			if(svchg==null || svchg.isEmpty()||svchg.isNullObject()){
				order.setSvchg(null);
			}else{
				//"service-charge":{"id":,"desc":"","desc2":"","value":, "type":},"service-charge-amount":,
				ServiceCharge serviceCharge = new ServiceCharge();
				serviceCharge.setId(svchg.getString("id"));
				serviceCharge.setDesc(svchg.getString("desc"));
				serviceCharge.setDesc2(svchg.getString("desc2"));
				serviceCharge.setType(svchg.getInt("type"));
				serviceCharge.setValue(new BigDecimal(svchg.getString("value")));
				order.setSvchg(serviceCharge);
			}
		}else
			order.setSvchg(null);
		String svchgAmount=jOrder.getString("service-charge-amount");
		if(svchgAmount==null||svchgAmount.trim().length()==0){
			System.out.println("service charge amount can be null.");
			status=1;
		}else{
			order.setSvchgAmount(new BigDecimal(svchgAmount));
		}
		//"tax":{"id":"","value":},"tax-amount":,
		if(jOrder.containsKey("tax")){
			JSONObject jTax = jOrder.getJSONObject("tax");
			if(jTax!=null&&!jTax.isEmpty()&&!jTax.isNullObject()){
				Tax tax = new Tax();
				tax.setTaxId(jTax.getString("id"));
				tax.setTaxValue(new BigDecimal(jTax.getString("value")));
				order.setTax(tax);
			}else
				order.setTax(null);
		}else
			order.setTax(null);
		String taxAmount=jOrder.getString("tax-amount");
		if(taxAmount==null||taxAmount.trim().length()==0){
			System.out.println("Tax amount can't be null.");
			status=1;
		}else{
			order.setTaxAmount(new BigDecimal(taxAmount));
		}
		//"discount":{"id":"","disc-type":,"rate":,"desc":"","desc2":""},"discount-amount":,
		if(jOrder.containsKey("discount")){
			JSONObject jDisc=jOrder.getJSONObject("discount");
			if(jDisc==null||jDisc.isEmpty()||jDisc.isNullObject()){
				order.setDiscount(null);
			}else{
				Discount disc = new Discount();
				disc.setDiscId(jDisc.getString("id"));
				disc.setDiscType(jDisc.getInt("disc-type"));
				disc.setDiscRate(new BigDecimal(jDisc.getString("rate")));
				disc.setDiscDesc(jDisc.getString("desc"));
				disc.setDiscDesc2(jDisc.getString("desc2"));
				order.setDiscount(disc);
			}
		}else
			order.setDiscount(null);
		String discAmount=jOrder.getString("discount-amount");
		if(discAmount==null||discAmount.trim().length()==0){
			System.out.println("Discount amount can't be null.");
			status=1;
		}else{
			order.setDiscAmount(new BigDecimal(discAmount));
		}
		//"subtotal-amount":,"total-amount":,"user-id":""
		String subTotal=jOrder.getString("subtotal-amount");
		if(subTotal==null||subTotal.trim().length()==0){
			System.out.println("Sub total amount can't be null.");
			status=1;
		}else
			order.setSubtotalAmount(new BigDecimal(subTotal));
		String totalAmount=jOrder.getString("total-amount");
		if(totalAmount==null||totalAmount.trim().length()==0){
			System.out.println("Sub total amount can't be null.");
			status=1;
		}else
			order.setTotalAmount(new BigDecimal(totalAmount));
		String userId=jOrder.getString("user-id");
		if(userId==null||userId.trim().length()==0){
			System.out.println("User id can't be null.");
			status=1;
		}else
			order.setUserId(userId);
		
	    if(jOrder.containsKey("delete-reason")&&jOrder.getJSONObject("delete-reason")!=null){
	    	JSONObject jReason = jOrder.getJSONObject("delete-reason");
	    	order.setReasonCode(jReason.getString("reason-code"));
	    	order.setReasonDesc(jReason.getString("reason-desc"));
	    	order.setReasonDesc2(jReason.getString("reason-desc2"));
	    }else{
	    	order.setReasonCode(null);
	    	order.setReasonDesc(null);
	    	order.setReasonDesc2(null);
	    }
		
		if(status==1){
			System.out.println("lack of information");
			return null;
		}else			
			return order;
	}
/*
 * "details":[{"item-id":,"seq":,"qty":,"price":,"subtype":, "is-modifier":,"link-row":,"modifier-value":,total-amount:,discount-able:,
            discount:{"id":"","disc-type":,"rate":,"desc":"","desc2":""},discount-amount:,
			service-charge-able:,
			service-charge:{"id":,"desc":"","desc2":"","value":, "type":},service-charge-amount:,
			tax-able:,
			tax:{"id":,"value":}, tax-amount:
			pay-amount:,cat-id:,desc:,desc2:,unit:,take-away:,
			delete-reason: {reason-code:, reason-desc:, reason-desc2}}]
 * */
	private List<OrderDetail> parseDetails(JSONArray jaDetail){
		if(jaDetail==null || jaDetail.size()==0)
			return null;
		List<OrderDetail> ls = new ArrayList<OrderDetail>();
		int status=0;
		for(int i=0;i<jaDetail.size();i++){
			JSONObject json = jaDetail.getJSONObject(i);
			OrderDetail orderDetail = new OrderDetail();
			String itemId=json.getString("item-id");
			if(itemId==null||itemId.trim().length()==0){
				System.out.println("Item id can't be null.");
				status=1;
			}else
				orderDetail.setItemId(itemId);
			orderDetail.setSeqNo(json.getInt("seq"));
			orderDetail.setQty(json.getInt("qty"));
			orderDetail.setPrice(new BigDecimal(json.getString("price")));
			orderDetail.setSubtype(json.getInt("subtype"));
			orderDetail.setIsModifier(json.getInt("is-modifier"));
			orderDetail.setLinkRow(json.getInt("link-row"));
			orderDetail.setModifierValue(new BigDecimal(json.getString("modifier-value")));
			orderDetail.setTotalAmount(new BigDecimal(json.getString("total-amount")));
			if(json.containsKey("discount-able"))
				orderDetail.setDiscAble(json.getInt("discount-able"));
			else
				orderDetail.setDiscAble(0);
			//"discount":{"id":"","disc-type":,"rate":,"desc":"","desc2":""},"discount-amount":,
			if(json.containsKey("discount")){
				JSONObject jDisc=json.getJSONObject("discount");
				if(jDisc==null||jDisc.isEmpty()||jDisc.isNullObject()){
					orderDetail.setDiscount(null);
				}else{
					Discount disc = new Discount();
					disc.setDiscId(jDisc.getString("id"));
					disc.setDiscType(jDisc.getInt("disc-type"));
					disc.setDiscRate(new BigDecimal(jDisc.getString("rate")));
					disc.setDiscDesc(jDisc.getString("desc"));
					disc.setDiscDesc2(jDisc.getString("desc2"));
					orderDetail.setDiscount(disc);
				}
			}else
				orderDetail.setDiscount(null);
			if(json.containsKey("discount-amount")){
				String discAmount=json.getString("discount-amount");
				if(discAmount==null||discAmount.trim().length()==0){
					orderDetail.setDiscAmount(new BigDecimal(0));
				}else{
					orderDetail.setDiscAmount(new BigDecimal(discAmount));
				}
			}else
				orderDetail.setDiscAmount(new BigDecimal(0));
			if(json.containsKey("service-charge-able"))
				orderDetail.setSvchgAble(json.getInt("service-charge-able"));
			else
				orderDetail.setSvchgAble(0);
			if(json.containsKey("service-charge")){
				JSONObject svchg=json.getJSONObject("service-charge");
				if(svchg==null || svchg.isEmpty()||svchg.isNullObject()){
					orderDetail.setServiceCharge(null);
				}else{
					//"service-charge":{"id":,"desc":"","desc2":"","value":, "type":},"service-charge-amount":,
					ServiceCharge serviceCharge = new ServiceCharge();
					serviceCharge.setId(svchg.getString("id"));
					serviceCharge.setDesc(svchg.getString("desc"));
					serviceCharge.setDesc2(svchg.getString("desc2"));
					serviceCharge.setType(svchg.getInt("type"));
					serviceCharge.setValue(new BigDecimal(svchg.getString("value")));
					orderDetail.setServiceCharge(serviceCharge);
				}
			}else
				orderDetail.setServiceCharge(null);
			if(json.containsKey("service-charge-amount")){
				String svchgAmount=json.getString("service-charge-amount");
				if(svchgAmount==null||svchgAmount.trim().length()==0){
					orderDetail.setSvchgAmount(new BigDecimal(0));		
				}else{
					orderDetail.setSvchgAmount(new BigDecimal(svchgAmount));
				}
			}else{
				orderDetail.setSvchgAmount(new BigDecimal(0));				
			}
			if(json.containsKey("tax-able"))
				orderDetail.setTaxAble(json.getInt("tax-able"));
			else
				orderDetail.setTaxAble(0);
			if(json.containsKey("tax")){
				JSONObject taxJson = json.getJSONObject("tax");
				if(taxJson==null || taxJson.isEmpty()||taxJson.isNullObject())
					orderDetail.setTaxInfo(null);
				else{
					//tax:{"id":,"desc":"","desc2":"","value":, "type":}, tax-amount:
					Tax tax = new Tax();
					tax.setTaxId(taxJson.getString("id"));
					//tax.setTaxDesc(taxJson.getString("desc"));
					//tax.setTaxDesc2(taxJson.getString("desc2"));
					//tax.setTaxType(taxJson.getInt("type"));
					tax.setTaxValue(new BigDecimal(taxJson.getString("value")));
					orderDetail.setTaxInfo(tax);
				}
			}else
				orderDetail.setTaxInfo(null);
			if(json.containsKey("tax-amount")){
				String taxAmountStr = json.getString("tax-amount");
				if(taxAmountStr==null||taxAmountStr.trim().length()==0){
					orderDetail.setTaxAmount(new BigDecimal(0));
				}else
					orderDetail.setTaxAmount(new BigDecimal(taxAmountStr));
			}else
				orderDetail.setTaxAmount(new BigDecimal(0));
			//pay-amount:,cat-id:,desc:,desc2:,unit:,take-away:
			String payAmount=json.getString("pay-amount");
			if(payAmount==null||payAmount.trim().length()==0){
				System.out.println("pay amount can be null.");
				status=1;
			}else
				orderDetail.setPayAmount(new BigDecimal(payAmount));
			orderDetail.setCatId(json.getString("cat-id"));
			orderDetail.setDesc(json.getString("desc"));
			orderDetail.setDesc2(json.getString("desc2"));
			orderDetail.setUnit(json.getString("unit"));
			orderDetail.setTakeAway(json.getInt("take-away"));
			if(json.containsKey("delete-reason")&&json.getJSONObject("delete-reason")!=null){
				JSONObject jReason = json.getJSONObject("delete-reason");
				orderDetail.setReasonCode(jReason.getString("reason-code"));
				orderDetail.setReasonDesc(jReason.getString("reason-desc"));
				orderDetail.setReasonDesc2(jReason.getString("reason-desc2"));
			}else{
				orderDetail.setReasonCode(null);
				orderDetail.setReasonDesc(null);
				orderDetail.setReasonDesc2(null);
			}
		
			if(status==1)
				return null;
			else
				ls.add(orderDetail);
		}
		if(ls.size()==0)
			return null;
		else
			return ls;
	}
	
	public JSONObject dealChangeCover(String shopId, String orderno, int cover){
		JSONObject json = new JSONObject();
		String msg;
		int status = 0;	
		String result = dbOrder.modifyCoverNumber(shopId, orderno, cover);
		if (result.equals("SUCCESS")) {
			status = 0;
			msg = ReturnMsgCode.SUCCESS;
		} else {
			status = 1;
			msg = ReturnMsgCode.DATA_ERROR;
		}
		json.put("status", status);
		json.put("msg", msg);
		return json;
	}
	
	public JSONObject dealChangeTable(String shopId, String orderNo, String newTableNo, String oldTableNo){
		JSONObject json = new JSONObject();
		String msg;
		int status = 0;
		String result = dbOrder.changeTable(shopId, orderNo, newTableNo,
				oldTableNo);
		if (result.equals("SUCCESS")) {
			status = 0;
			msg = ReturnMsgCode.SUCCESS;
		} else if(result.equals("TABLE_OCCUPIED")){
			status = 1;
			msg = ReturnMsgCode.TABLE_OCCUPIED;
		}
		else {
			status = 1;
			msg = ReturnMsgCode.DATA_ERROR;
		}
		json.put("status", status);
		json.put("msg", msg);
		return json;
	}
	public JSONObject dealReqPrintOrder(String shopId, String orderNo) {
		JSONObject json = new JSONObject();
		String msg;
		int status = 0;	
		Order order = dbOrder.getOrder(shopId, orderNo);
		boolean result = printer.printListForCustomer(order);
		if(result){
			status = 0;
			msg = ReturnMsgCode.SUCCESS;
		}else{
			status = 1;
			msg = ReturnMsgCode.PRINT_ERROR;
		}
		json.put("status", status);
		json.put("msg", msg);
		return json;
	}
	
}
