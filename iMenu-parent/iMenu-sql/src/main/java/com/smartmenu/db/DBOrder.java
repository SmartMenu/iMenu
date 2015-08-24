package com.smartmenu.db;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.smartmenu.common.PrintProperty;
import com.smartmenu.entity.Discount;
import com.smartmenu.entity.Order;
import com.smartmenu.entity.OrderDetail;
import com.smartmenu.entity.ServiceCharge;
import com.smartmenu.entity.Tax;

@Component
public class DBOrder{
	
	@Autowired
	private DataSource dataSource;
	@Autowired
	private PrintProperty printProperty; 
	@Autowired
	private DBCommonUtil dbCommonUtil;
	
	//tranNo, checkNo
	private synchronized String[] generateTranNoAndCheckNo(Connection conn, String shopId){
		
		//String sql="select id, seq, prefix, suffix, [length] from [dbo].[tranno] with (HOLDLOCK, TABLOCK) " +
		//			" where shop_id='"+shopId+"' and (pos_id='"+posId+"' or pos_id='') and (id='SALESTRANNO' or id='CHECKNO' or id='SLIPNO') order by pos_id desc;";
		
		String sql="select id, seq, prefix, suffix, [length] from [dbo].[tranno] with (HOLDLOCK, TABLOCK) " +
					" where shop_id='"+shopId+"' and (id='IMENUCHECKNO' or id='IMENUSALESTRANNO');";
		System.out.println("GenerateTranNo: " + sql);
		String tranNo;
		String checkNo;
		List<Object> lsResult = dbCommonUtil.query(conn, sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				Map<String,String> map = new HashMap<String, String>();
				while(rs.next()){
					String id = rs.getString("id");
					String prefix=rs.getString("prefix");
					if(prefix==null)
						prefix="";
					String suffix=rs.getString("suffix");
					if(suffix==null)
						suffix="";
					int length = rs.getInt("length");
					int seq=rs.getInt("seq");
					//String no=prefix+(seq+1)+suffix;
					String no=(seq+1)+suffix;
					int currLength = no.length()+prefix.length();
					if(currLength<=length){
						for(int i=0;i<length-currLength;i++){
							no="0"+no;
						}
						no=prefix+no;
					}else{
						System.out.println(id + " sequence no is longer than expected.");
						continue;
					}
					map.put(id, no);
				}
				if(map.isEmpty())
					return null;
				List<Object> ls = new ArrayList<Object>();
				ls.add(map);
				return ls;
			}
		});
		
		if(lsResult == null || lsResult.size()== 0)
			return null;
		Map<String, String> map = (Map<String,String>)lsResult.get(0);
		if(!map.containsKey("IMENUCHECKNO")||!map.containsKey("IMENUSALESTRANNO"))
			return null;
		else{
			checkNo=map.get("IMENUCHECKNO");
			tranNo=map.get("IMENUSALESTRANNO");
			return new String[]{tranNo, checkNo};
		}
	}

	private boolean updateTranNoSettings(Connection conn, String shopId){
		String sql="update [dbo].[tranno] set seq=seq+1 "+
				" where shop_id='"+shopId+"' and (id='IMENUCHECKNO' or id='IMENUSALESTRANNO');";
		System.out.println("UpdateTranNoSetting: "+ sql);
		int count = dbCommonUtil.execute(conn, sql);
		if(count>0)
			return true;
		else
			return false;
	}
	
	public String addNewOrder(Order order, List<OrderDetail> lsOrderDetail){
		String resultMsg;
		Connection conn=null;
		
		try {
			conn = dataSource.getConnection();
			conn.setAutoCommit(false);
			String[] strNos = this.generateTranNoAndCheckNo(conn, order.getShopId());
			if(strNos!=null){
				updateTranNoSettings(conn, order.getShopId());
				String tranNo = strNos[0];
				order.setTranNo(tranNo);
				order.setCheckNo(strNos[1]);
				//
				Calendar ca = Calendar.getInstance();
				ca.setTimeInMillis(System.currentTimeMillis());
				ca.set(Calendar.HOUR_OF_DAY, 0);
				ca.set(Calendar.MINUTE, 0);
				ca.set(Calendar.SECOND, 0);
				Timestamp tranDate = new Timestamp(ca.getTimeInMillis());
				order.setTranDate(tranDate);
				Timestamp checkDate = new Timestamp(System.currentTimeMillis());
				order.setCheckDate(checkDate);
				Map<String,String> mapOrderProperty = this.buildOrderProperty(order);
				String orderSql = this.buildInsertSql("[dbo].[sales_header]", mapOrderProperty);
				System.out.println("INSERT ORDER: " + orderSql);
			    int count = dbCommonUtil.execute(conn, orderSql);
			    if(count==-1){
				   System.out.println("ERROR: Insert order failed.");
				   conn.rollback();
				   resultMsg="ADD_ORDER_FAILED";
			    }else{
				   //insert details
				   StringBuffer detailsSql = new StringBuffer();
				   for(OrderDetail orderDetail: lsOrderDetail){
					   Map<String,String> detailProperty = this.buildOrderDetailProperty(order, orderDetail);
					   String sqlTmp = this.buildInsertSql("[dbo].[sales_details]", detailProperty);
					   detailsSql.append(sqlTmp);
				   }
				   //append update dept_id and class_id from sales_details
				   detailsSql.append("update dbo.sales_details set dept_id = b.dept_id, class_id = b.class_id " +
							 " from dbo.item b where b.item_code = code and shop_id='"+order.getShopId() +
							 "' and tran_no='" + tranNo + "' and sales_details.dept_id is null " +
							 " and sales_details.class_id is null;");
				   System.out.println("INSERT DETAILS: "+detailsSql.toString());
				   int detail_count=dbCommonUtil.execute(conn, detailsSql.toString());
				   if(detail_count==-1){
					   System.out.println("ERROR: Insert order details failed.");
					   conn.rollback();
					   resultMsg="ADD_ORDER_DETAIL_FAILED";
				   }else{
						// update table status
						int result = modifyTableStatus(conn, order);
						if (result == 0) {
							System.out.println("Modify table status success.");
							conn.commit(); // /
							resultMsg = "SUCCESS";
						} else if (result == -1) {
							System.out
									.println("ERROR: table_status operation_status = 130 or 131");
							conn.rollback();
							resultMsg = "TABLE_UNAVAILABLE";
						} else {
							System.out
									.println("ERROR: modify table_status failed");
							conn.rollback();
							resultMsg = "MODIFY_TABLE_STATUS_FAILED";
						}
					  
				   }
			   }
			}else{
				resultMsg = "GENERATE_TRANNO_FAILED";
			}
			
		} catch (SQLException e){
			resultMsg = "SQL_ERROR";
			e.printStackTrace();
			try{
				if(conn!=null && !conn.isClosed())
					conn.rollback();
			} catch (SQLException ex){
				ex.printStackTrace();
			}
			
		} finally{
			try{
				if(conn != null && !conn.isClosed()){
					conn.setAutoCommit(false);
					conn.close();
				}
			} catch (SQLException ex){
				ex.printStackTrace();
			}
		}
		
		return resultMsg;
	}
	//update existing order and insert new details
	public String appendExistOrder(Order order, List<OrderDetail> lsNewOrderDetail){
		String resultMsg="";
		Connection conn=null;
		try {
			conn = dataSource.getConnection();
			conn.setAutoCommit(false);
			String updateSql="update [dbo].[sales_header] set svchg_amount="+order.getSvchgAmount().toPlainString()+
					", tax_amount="+order.getTaxAmount().toPlainString()+
					", subtotal_amount="+order.getSubtotalAmount().toPlainString()+
					", balance_amount="+order.getSubtotalAmount().toPlainString()+
					", total_amount="+order.getTotalAmount().toPlainString()+
					", modify_date=GETDATE(), modify_by='"+order.getUserId()+"', "
					+ " lastorder_by='"+order.getUserId()+"', "
					+ "capture_systype=1, capture_systime=GETDATE(), capture_reproc_req=1, capture_reproc_status=0 ";
			
			updateSql += " where tran_no='"+order.getTranNo()+"' and shop_id='"+order.getShopId()+"'";
			System.out.println("Update order: " + updateSql);
			int count=dbCommonUtil.execute(conn, updateSql);
			if(count==-1){
				System.out.println("Insert order failed.");
				conn.rollback();
				resultMsg="UPDATE_ORDER_FAILED";
			}else{
				//insert details
			   Order newOrder = this.getOrder(conn, order.getShopId(), order.getTranNo());
			   StringBuffer detailsSql = new StringBuffer();
			   for(OrderDetail orderDetail: lsNewOrderDetail){
				   Map<String,String> detailProperty = this.buildOrderDetailProperty(newOrder, orderDetail);
				   String sqlTmp = this.buildInsertSql("[dbo].[sales_details]", detailProperty);
				   detailsSql.append(sqlTmp);
			   }
			 //append update dept_id and class_id from sales_details
			   detailsSql.append("update dbo.sales_details set dept_id = b.dept_id, class_id = b.class_id " +
						 " from dbo.item b where b.item_code = code and shop_id='"+order.getShopId() +
						 "' and tran_no='" + order.getTranNo() + "' and sales_details.dept_id is null " +
						 " and sales_details.class_id is null;");
			   System.out.println("INSERT DETAILS: "+detailsSql.toString());
			   int detail_count=dbCommonUtil.execute(conn, detailsSql.toString());
			   if(detail_count==-1){
				   System.out.println("Insert new order details failed.");
				   conn.rollback();
				   resultMsg="ADD_ORDER_DETAIL_FAILED";
			   }else{
				   System.out.println("update order details success.");
				   conn.commit();
				   resultMsg="SUCCESS";
			   }
			}
		}catch (SQLException e){
			resultMsg = "SQL_ERROR";
			e.printStackTrace();
			try{
				if(conn!=null && !conn.isClosed())
					conn.rollback();
			} catch (SQLException ex){
				ex.printStackTrace();
			}
			
		} finally{
			try{
				if(conn != null && !conn.isClosed()){
					conn.setAutoCommit(false);
					conn.close();
				}
			} catch (SQLException ex){
				ex.printStackTrace();
			}
		}
		return resultMsg;
	}
	
	private Map<String, String> buildOrderProperty(Order order){
		Map<String, String> map = new HashMap<String, String>();
		map.put("shop_id", "'"+order.getShopId()+"'");
		map.put("pos_id", "'"+order.getPosId()+"'");
		map.put("tran_type", "0");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		map.put("tran_date", "'"+sdf.format(order.getTranDate())+"'");
		map.put("tran_no", "'"+order.getTranNo()+"'");
		map.put("check_no", "'"+order.getCheckNo()+"'");
		map.put("check_date", "'"+sdf.format(order.getCheckDate())+"'");
		map.put("table_no", "'"+order.getTableId()+"'");
		map.put("section_id", "'"+order.getSectionId()+"'");
		map.put("cur_rate1", "0");
		map.put("cur_rate2", "0");
		ServiceCharge svchg = order.getSvchg();
		if(svchg!=null){
			map.put("chg_id", "'"+svchg.getId()+"'");
			map.put("svchg_rate", svchg.getValue().toPlainString());
			map.put("svchg_desc1", "N'"+svchg.getDesc()+"'");
			map.put("svchg_desc2", "N'"+svchg.getDesc2()+"'");
			map.put("svchg_by", "'"+order.getUserId()+"'");
		}
		map.put("svchg_amount", order.getSvchgAmount().toPlainString());
		Tax tax = order.getTax();
		if(tax!=null){
			map.put("tax_id", "'"+tax.getTaxId()+"'");
			map.put("tax_rate", tax.getTaxValue().toPlainString());
		}else
			map.put("tax_id", "''");
		map.put("tax_amount", order.getTaxAmount().toPlainString());
		map.put("subtotal_amount", order.getSubtotalAmount().toPlainString());
		map.put("balance_amount", order.getTotalAmount().toPlainString());
		map.put("total_amount", order.getTotalAmount().toPlainString());
		map.put("table_code", order.getTableId());
		map.put("create_date", "GETDATE()");
		map.put("create_by", "'"+order.getUserId()+"'");
		map.put("modify_date", "GETDATE()");
		map.put("modify_by", "'"+order.getUserId()+"'");
		map.put("capture_systype", "1");
		map.put("capture_systime", "GETDATE()");
		map.put("capture_reproc_req", "1");
		map.put("capture_reproc_status", "0");
		map.put("settled", "0");
		map.put("subtype", "1");
		map.put("table_type", "1");
		
		map.put("cashier_closeid", "''");
		map.put("start_id", "''");
		map.put("cashier_startid", "''");
		map.put("rec_shop", "''");
		map.put("receipt_no", "''");
		map.put("void_shop", "''");
		map.put("void_pos", "''");
		map.put("void_by", "''");
		map.put("void_reason_code", "''");
		map.put("void_reason_desc1", "''");
		map.put("void_reason_desc2", "''");
		map.put("void_reference", "''");
		map.put("table_suffix", "''");
		map.put("rec_pos", "''");
		map.put("seat_no", "''");
		map.put("cust_no", "''");
		map.put("cover", ""+order.getCover());
		map.put("cover_charge", "''");
		if(order.getDiscount()!=null){
			map.put("disc_id", "'"+order.getDiscount().getDiscId()+"'");
			map.put("disc_desc1", "N'"+order.getDiscount().getDiscDesc()+"'");
			map.put("disc_desc2", "N'"+order.getDiscount().getDiscDesc2()+"'");
			map.put("disc_type", ""+order.getDiscount().getDiscType());
			map.put("disc_by", "'"+order.getUserId()+"'");
			map.put("disc_ref", "''");
			
		}else{
			map.put("disc_id", "''");
			map.put("disc_desc1", "''");
			map.put("disc_desc2", "''");
			map.put("disc_type", "0");
			map.put("disc_by", "''");
			map.put("disc_ref", "''");
		}
		map.put("svchg_by", "''");
		map.put("minchg_id", "''");
		map.put("cashier_id", "''");
		map.put("sent_by", "''");
		map.put("firstorder_by", "'"+order.getUserId()+"'");
		map.put("lastorder_by", "'"+order.getUserId()+"'");
		return map;
	}
	private Map<String, String> buildOrderDetailProperty(Order order, OrderDetail detail){
		Map<String, String> map = new HashMap<String, String>();
		map.put("shop_id", "'"+order.getShopId()+"'");
		map.put("pos_id", "'"+order.getPosId()+"'");
		map.put("tran_type", "0");
		map.put("tran_no", "'"+order.getTranNo()+"'");
		map.put("check_no", "'"+order.getCheckNo()+"'");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		map.put("tran_date", "'"+sdf.format(order.getTranDate())+"'");
		map.put("det_type", "0");
		map.put("seqno", ""+detail.getSeqNo()+"");
		map.put("subtype",""+detail.getSubtype()); ///////////////////////////
		//map.put("link_row","");
		map.put("shift_no", "0");
		//map.put("[close]", "0");
		map.put("start_id", "' '");
		map.put("order_date", "GETDATE()");
		//map.put("level_no","");
		map.put("code","'"+detail.getItemId()+"'");
		//map.put("dept_id","");
		map.put("cat_id","'"+detail.getCatId()+"'");
		//map.put("class_id", "");
		map.put("desc1", "N'"+detail.getDesc()+"'");
		map.put("desc2", "N'"+detail.getDesc2()+"'");
		map.put("qty", ""+detail.getQty()+"");
		map.put("rate", "1");
		map.put("unit", "N'"+detail.getUnit()+"'");
		map.put("price_level", "1");
		map.put("price", detail.getPrice().toPlainString());
		map.put("amount", detail.getTotalAmount().toPlainString());
		map.put("discountable", ""+detail.getDiscAble());
		Discount disc = detail.getDiscount();
		if(disc!=null){
			map.put("disc_id", "'"+disc.getDiscId()+"'");
			map.put("disc_type", ""+disc.getDiscType());
			map.put("disc_rate", disc.getDiscRate().toPlainString());
			map.put("disc_by", "'"+order.getUserId()+"'");
		}else
			map.put("disc_type", "0");
		map.put("disc_amount", detail.getDiscAmount().toPlainString());
		map.put("total_amount", detail.getPayAmount().toPlainString());
		map.put("cdisc_amount", "0");
		map.put("svchargeable", detail.getSvchgAble()+"");
		ServiceCharge svchg = detail.getServiceCharge();
		if(svchg!=null){
			map.put("svchg_rate", svchg.getValue().toPlainString());
		}
		//map.put("taxable", value);
		//map.put("tax_id", value);
		map.put("tax_rate", "0");
		map.put("tax_amount", "0");
		map.put("net_amount", detail.getPayAmount().toPlainString());
		map.put("order_by", "'"+order.getUserId()+"'");
		map.put("order_shop", "'"+order.getShopId()+"'");
		map.put("order_pos", "'"+order.getPosId()+"'");
		//map.put("is_modifier", value);
		map.put("cost", "0");
		//map.put("stock_code", value);
		map.put("total_cost", "0");
		map.put("print_count", "0");
		map.put("ticket_print", "0");
		map.put("ticket_printed", "0");
		map.put("ticketprn_updcount", "0");
		map.put("buy_qty", "0");
		map.put("free_qty", "0");
		map.put("create_date", "GETDATE()");
		map.put("create_by", "'"+order.getUserId()+"'");
		map.put("modify_date", "GETDATE()");
		map.put("modify_by", "'"+order.getUserId()+"'");
		map.put("update_count", "1");
		map.put("sent_count", "0");
		map.put("sent_seq", "0");
		map.put("sent_by", "''");
		map.put("posted", "0");
		map.put("posted2", "0");
		map.put("posted3", "0");
		map.put("posted4", "0");
		map.put("posted5", "0");
		//map.put("plu_no", value);
		map.put("split_code", "''");
		map.put("source_table", "' '");
		map.put("modifier1_id","''");
		map.put("modifier1_value","0");
		map.put("modifier1_op","0");
		map.put("modifier2_id","''");
		map.put("modifier2_value","0");
		map.put("modifier2_op","0");
		map.put("rush","0");
		map.put("pantry","0");
		map.put("order_ticket","0");
		map.put("bonus_redeem","0");
		map.put("splitrev_amount","0");
		map.put("nonsales_amount","0");
		map.put("nonsales","0");
		map.put("upload_status1","0");
		map.put("upload_status2","0");
		map.put("upload_status3","0");
		map.put("upload_status4","0");
		map.put("upload_status5","0");
		//map.put("stock_flag",value);
		map.put("rush_count","0");
		map.put("capture_systype","1");  //for print
		map.put("capture_systime","GETDATE()"); //for print
		map.put("capture_reproc_req","1"); //for print
		map.put("capture_reproc_status","0"); //for print
		map.put(" takeaway_mode",detail.getTakeAway()+"");
/////////////////		
		map.put("ivoid_qty", "0");
		map.put("ivoid_amount", "0");
		map.put("ivoid_total", "0");
		map.put("ivoid_printed", "0");
		map.put("ivoid_ktprinted", "0");
		//////////reason
		if(detail.getReasonCode() != null)
			map.put("ivoid_reason_code", detail.getReasonCode());
		if(detail.getReasonDesc() != null)
			map.put("ivoid_reason_desc1", detail.getReasonDesc());
		if(detail.getReasonDesc2() != null)
			map.put("ivoid_reason_desc2", detail.getReasonDesc2());
		return map;
	}
	
	private String buildInsertSql(String dbTableName, Map<String, String> mapProperty){
		StringBuffer propertyPart = new StringBuffer();
		StringBuffer valuePart = new StringBuffer();
		for(String key: mapProperty.keySet()){
			propertyPart.append(key+",");
			valuePart.append(mapProperty.get(key)+",");
		}
		String sql="insert into " + dbTableName + " ("+propertyPart.substring(0, propertyPart.length()-1)+") " +
					" values ("+valuePart.substring(0, valuePart.length()-1)+");";
		System.out.println("Insert sql: " + sql);
		return sql;
	}
	//
	private static final String orderProperty=" shop_id, pos_id, tran_type, tran_no, check_no, tran_date, check_date, table_no, section_id," +
	                                          "svchg_amount, tax_amount,disc_amount,subtotal_amount,total_amount " ;
	public Order getExistOrder(String shopId, String tableId){
		String sql="select top 1 " + orderProperty +
				   " from dbo.sales_header " +
				   " where shop_id='"+shopId+"' and table_no='"+tableId+"' and settled=0 and void_status=0 order by tran_date desc;";
		System.out.println("GetExistOrder: " + sql);
		Order[] orders = queryOrders(sql);
		
		if(orders==null || orders.length==0)
			return null;
		else
			return orders[0];
		
	}
	public Order getOrder(String shopId, String tranNo){
		String sql="select " + orderProperty + " from dbo.sales_header where tran_no='"+tranNo+"' and shop_id='"+shopId+"'";
		System.out.println("Get Order by TranNO: " + sql);
		Order[] orders = queryOrders(sql);
		
		if(orders==null || orders.length==0)
			return null;
		else
			return orders[0];
	}
	public Order getOrder(Connection conn, String shopId, String tranNo){
		String sql="select " + orderProperty + " from dbo.sales_header where tran_no='"+tranNo+"' and shop_id='"+shopId+"'";
		System.out.println("Get Order by TranNO: " + sql);
		Order[] orders = queryOrders(conn, sql);
		
		if(orders==null || orders.length==0)
			return null;
		else
			return orders[0];
	}
	
	
	private Order[] queryOrders(String sql){
		//System.out.println("Query Orders SQL: " + sql);
		List<Object> lsResult = dbCommonUtil.query(sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				while(rs.next()){
					Order order = new Order();
					order.setShopId(rs.getString("shop_id"));
					order.setPosId(rs.getString("pos_id"));
					order.setTranNo(rs.getString("tran_no"));
					order.setCheckNo(rs.getString("check_no"));
					order.setTranDate(rs.getTimestamp("tran_date"));
					order.setCheckDate(rs.getTimestamp("check_date"));
					order.setSectionId(rs.getString("section_id"));
					order.setSvchgAmount(rs.getBigDecimal("svchg_amount"));
					order.setTaxAmount(rs.getBigDecimal("tax_amount"));
					order.setDiscAmount(rs.getBigDecimal("disc_amount"));
					order.setSubtotalAmount(rs.getBigDecimal("subtotal_amount"));
					order.setTotalAmount(rs.getBigDecimal("total_amount"));
					ls.add(order);
				}
				if(ls==null || ls.size()==0)
					return null;
				else
					return ls;
			}
			
		});
		
		if(lsResult==null || lsResult.size()==0)
			return null;
		else
			return lsResult.toArray(new Order[]{});
	} 
	
	private Order[] queryOrders(Connection conn, String sql){
		//System.out.println("Query Orders SQL: " + sql);
		List<Object> lsResult = dbCommonUtil.query(conn, sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				while(rs.next()){
					Order order = new Order();
					order.setShopId(rs.getString("shop_id"));
					order.setPosId(rs.getString("pos_id"));
					order.setTranNo(rs.getString("tran_no"));
					order.setCheckNo(rs.getString("check_no"));
					order.setTranDate(rs.getTimestamp("tran_date"));
					order.setCheckDate(rs.getTimestamp("check_date"));
					order.setSectionId(rs.getString("section_id"));
					order.setSvchgAmount(rs.getBigDecimal("svchg_amount"));
					order.setTaxAmount(rs.getBigDecimal("tax_amount"));
					order.setDiscAmount(rs.getBigDecimal("disc_amount"));
					order.setSubtotalAmount(rs.getBigDecimal("subtotal_amount"));
					order.setTotalAmount(rs.getBigDecimal("total_amount"));
					ls.add(order);
				}
				if(ls==null || ls.size()==0)
					return null;
				else
					return ls;
			}
			
		});
		
		if(lsResult==null || lsResult.size()==0)
			return null;
		else
			return lsResult.toArray(new Order[]{});
	} 
	public OrderDetail[] getOrderDetail(String shopId, String tranNo){
		String sql="  select a.code as item_id, a.seqno, case when a.ivoid_qty is null then a.qty else a.qty-a.ivoid_qty end as qty, " + 
				    " a.price, a.desc1 as name, a.desc2 as name2, a.cat_id,b.desc1 as cat_name, b.desc2 as cat_name2 " +
					" from dbo.sales_details a, dbo.category b " +
					" where a.cat_id=b.cat_id and "	+ 
					" shop_id='"+shopId+"' and tran_no='"+tranNo+"' and ivoid_status<>1;";
		System.out.println("Exist order details: " + sql);
		List<Object> lsResult = dbCommonUtil.query(sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls=new ArrayList<Object>();
				while(rs.next()){
					if(rs.getInt("qty") == 0)
						continue;
					OrderDetail detail = new OrderDetail();
					detail.setCatId(rs.getString("cat_id"));
					detail.setCatName(rs.getString("cat_name"));
					detail.setCatName2(rs.getString("cat_name2"));
					detail.setPrice(rs.getBigDecimal("price"));
					detail.setQty(rs.getInt("qty"));
					detail.setItemId(rs.getString("item_id"));
					detail.setDesc(rs.getString("name"));
					detail.setDesc2(rs.getString("name2"));
					detail.setSeqNo(rs.getInt("seqno"));
					ls.add(detail);
				}
				if(ls==null || ls.size()==0)	
					return null;
				else
					return ls;
			}
			
		});
		if(lsResult==null||lsResult.size()==0)
			return null;
		else
			return lsResult.toArray(new OrderDetail[]{});
	}
	
	private Map<String, String> buildTableStatusProperty(Order order){
		Map<String, String> map=new HashMap<String, String>();
		map.put("table_id", "'"+order.getTableId()+"'");
		map.put("operation_status", "2");
		map.put("status_time", "GETDATE()");
		map.put("cover", ""+order.getCover());
		map.put("create_date", "GETDATE()");////////////
		map.put("create_by", "'"+order.getUserId()+"'");
		map.put("modify_date", "GETDATE()");
		map.put("modify_by", "'"+order.getUserId()+"'");
		map.put("shop_id", "'"+order.getShopId()+"'");
		map.put("table_code", "'"+order.getTableId()+"'");
		map.put("pos_id", "'"+order.getPosId()+"'");
		map.put("tran_no", "'"+order.getTranNo()+"'");
		map.put("check_no", "'"+order.getCheckNo()+"'");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		map.put("tran_date", "'"+sdf.format(order.getTranDate())+"'");
		map.put("check_date", "'"+sdf.format(order.getCheckDate())+"'");
		map.put("total_amount", order.getTotalAmount().toPlainString());
		return map;
	}
	
	
	private int modifyTableStatus(Connection conn, Order order){
		String tableId=order.getTableId();
		String sql = "select * from [dbo].[table_status] where shop_id='" + order.getShopId() + "' and table_id='"+tableId+"' and (operation_status=130 or operation_status=131);";
		boolean flag=dbCommonUtil.checkExist(conn, sql);
		if(flag)
			return -1;
		String tsSql="delete from [dbo].[table_status] where shop_id='" + order.getShopId() + "' and table_id='"+tableId+"';"; 
		dbCommonUtil.execute(conn, tsSql);
		tsSql=this.buildInsertSql("[dbo].[table_status]", this.buildTableStatusProperty(order));
		int ts_count=dbCommonUtil.execute(conn, tsSql);
		if(ts_count==-1)
			return 1;
		else
			return 0;
	}
	
	//update cover number of details
	public String modifyCoverNumber(String shopId, String tranNo, int newCoverNumber){
		String resultMsg="";
		Connection conn = null;
		try {
			conn = dataSource.getConnection();
			conn.setAutoCommit(false);
			String sql = "update dbo.sales_header set cover=" + newCoverNumber + 
					    " where shop_id='" + shopId + "' and tran_no='" + tranNo + "' and tran_type=0";
			System.out.println("Modify Cover in sales_header SQL: " + sql);
			int result = dbCommonUtil.execute(conn, sql);
			String sql2 = "update dbo.table_status set cover=" + newCoverNumber + 
					" where shop_id='" + shopId + "' and tran_no='" + tranNo + "'";
			System.out.println("Modify Cover in table_status SQL: " + sql2);
			int result2 = dbCommonUtil.execute(conn, sql2);
			if(result==1 && result2==1){
				System.out.println("Update successfully.");
				conn.commit();
				resultMsg += "SUCCESS";
			}else{
				if(result!=1){
					System.out.println("dbo.sales_header update failed.");
					resultMsg += "UPDATE_SALES_HEADER_FAILED";
				}
				if(result2!=1){
					System.out.println("dbo.table_status update failed.");
					resultMsg += "UPDATE_TABLE_STATUS_FAILED";
				}
				conn.rollback();
			}
		} catch (SQLException e){
			resultMsg += "DB_ERROR";
			e.printStackTrace();
			try{
				if(conn!=null && !conn.isClosed())
					conn.rollback();
			} catch (SQLException ex){
				ex.printStackTrace();
			}
			
		} finally{
			try{
				if(conn != null && !conn.isClosed()){
					conn.setAutoCommit(false);
					conn.close();
				}
			} catch (SQLException ex){
				ex.printStackTrace();
			}
		}
		return resultMsg;
	}

	//change table 
	public String changeTable(String shopId, String orderNo, String newTableNo,
			String oldTableNo) {
		
		String resultMsg="";
		Connection conn = null;
		try {
			conn = dataSource.getConnection();
			conn.setAutoCommit(false);
			//check if the table occupied or not today.
			String querySql = "select table_id from dbo.table_status with (HOLDLOCK, TABLOCK)"
					+ " where table_id='"+ newTableNo + "' "
					+ " and shop_id='" + shopId + "'"
					+ " and operation_status<>0 "
					+ " and DATEDIFF(DD, status_time, GETDATE())=0";
			System.out.println("Query Table Status: " + querySql);
			boolean blExist = dbCommonUtil.checkExist(conn, querySql);
			if(blExist){
				resultMsg = "TABLE_OCCUPIED";

			}else{// when the table is empty, do next.
				// 1. delete the new table's information from table_status
				String deleteSql = "delete from dbo.table_status where table_id='" + newTableNo	+ "' "
						+ " and shop_id='" + shopId + "';";
						//+ " and operation_status=0 "
						//+ " and DATEDIFF(DD, status_time, GETDATE())=0;";
				System.out.println("Delete Table Information: " + deleteSql);
				dbCommonUtil.execute(conn, deleteSql);
				// 2. update the record of old table to new table
				String updateSql = "update dbo.table_status set table_id='"	+ newTableNo + "', "
						+ " table_code='" + newTableNo 	+ "', "
						+ " status_time=GETDATE(),"
						+ " modify_date=GETDATE() " 
						+ " where table_id='" + oldTableNo + "' "
						+ " and shop_id='" + shopId + "'"
						+ " and DATEDIFF(DD, status_time, GETDATE())=0 "
						+ " and operation_status<>0";
				System.out.println("Change Table: " + updateSql);
				int result = dbCommonUtil.execute(conn, updateSql);
				String updateSql_header = "update dbo.sales_header set table_no='" + newTableNo + "' "
						+ " where tran_no='" + orderNo + "' " 
						+ " and shop_id='" + shopId + "' ;";
				System.out.println("Update Sales Header: " + updateSql_header);
				int result1 = dbCommonUtil.execute(conn, updateSql_header);
				String updateSql_detail = "update dbo.sales_details set source_table='" + newTableNo + "' "
						+ " where shop_id='" + shopId + "' "
						+ " and tran_no='" + orderNo + "'";
				System.out.println("Update Sales Details: " + updateSql_detail);
				int result2 = dbCommonUtil.execute(conn, updateSql_detail);
				if (result == 1 && result1 == 1 && result2 >= 1) {
					System.out
							.println("modify table_status, sales_header, sales_details success. ");
					resultMsg = "SUCCESS";
					
				} else {
					if (result != 1)
						System.out.println("modify table_status failed.");
					if (result1 != 1)
						System.out.println("modify sales_header failed.");
					if (result2 < 1)
						System.out.println("modify sales_details failed");

					resultMsg += "FAIL";
					
				}
			}
			if(resultMsg.equals("SUCCESS"))
				conn.commit();
			else
				conn.rollback();
				
		} catch (SQLException e){
			resultMsg = "SQL_ERROR";
			e.printStackTrace();
			try{
				if(conn!=null && !conn.isClosed())
					conn.rollback();
			} catch (SQLException ex){
				ex.printStackTrace();
			}
			
		} finally{
			try{
				if(conn != null && !conn.isClosed()){
					conn.setAutoCommit(false);
					conn.close();
				}
			} catch (SQLException ex){
				ex.printStackTrace();
			}
		}
		return resultMsg;
	}
	//
	private int getMaxSeqNoOfOrderDetails(Connection conn, String shopId, String transNo){
		String sql = "select max(seqno) as seqno from dbo.sales_details where shop_id='"+shopId+"' "
				  + " and tran_no='" + transNo + "'";
		
		List<Object> lsResult = dbCommonUtil.query(conn, sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				if(rs.next()){
					int seqno = rs.getInt("seqno");
					List<Object> ls = new ArrayList<Object>();
					ls.add(seqno);
					return ls;
				}
				return null;
			}
			
		});
		if(lsResult==null||lsResult.size()==0)
			return 1;
		else{
			return (int)lsResult.get(0);
		}
	}
	
    //delete items from an exist order
	public String deleteFromExistOrder(Order order, List<OrderDetail> lsDeleteOrderDetail) {
		
		Connection conn=null;
		try {
			conn = dataSource.getConnection();
			conn.setAutoCommit(false);
			//#01. update order info
			String updateSql="update [dbo].[sales_header] set svchg_amount="+order.getSvchgAmount().toPlainString()+
					", tax_amount="+order.getTaxAmount().toPlainString()+
					", subtotal_amount="+order.getSubtotalAmount().toPlainString()+
					", balance_amount="+order.getSubtotalAmount().toPlainString()+
					", total_amount="+order.getTotalAmount().toPlainString()+
					", modify_date=GETDATE(), modify_by='"+order.getUserId()+"', "
					+ " lastorder_by='"+order.getUserId()+"', "
					+ "capture_systype=1, capture_systime=GETDATE(), capture_reproc_req=1, capture_reproc_status=0 ";
			if(order.getReasonCode() != null)
				updateSql += ", void_reason_code='" + order.getReasonCode() + "' ";
			if(order.getReasonDesc() != null)
				updateSql += ", void_reason_desc1='" + order.getReasonDesc() + "' ";
			if(order.getReasonDesc2() != null)
				updateSql += ", void_reason_desc2='" + order.getReasonDesc2() + "' ";

			updateSql += " where tran_no='"+order.getTranNo()+"' and shop_id='"+order.getShopId()+"'";
			System.out.println("Update order: " + updateSql);
			int count=dbCommonUtil.execute(conn, updateSql);
			if(count==-1){
				System.out.println("Insert order failed.");
				conn.rollback();
				return "UPDATE_ORDER_FAILED";
			}
			//#02. update delete info to existing items
		    Order newOrder = this.getOrder(conn, order.getShopId(), order.getTranNo());
		    StringBuffer updateDetailSql = new StringBuffer();
		    for(OrderDetail orderDetail: lsDeleteOrderDetail){
			   String tmp = "update dbo.sales_details set ivoid_status=2, ivoid_qty="+
		                     orderDetail.getQty()+", ivoid_amount="+orderDetail.getTotalAmount()+
		                     ", ivoid_total="+orderDetail.getPayAmount()+
		                     //", qty=qty-"+orderDetail.getQty()+
		                     //", amount=amount-"+orderDetail.getTotalAmount()+
		                     //", total_amount=total_amount-"+orderDetail.getPayAmount()+
		                     ", modify_date=GETDATE(), modify_by='"+order.getUserId()+"'"+
		                     " where shop_id='"+order.getShopId()+"' "
		                     + " and tran_no='"+order.getTranNo()+"' "
		                     + " and code='" + orderDetail.getItemId() + "' "
		                     + " and seqno="+orderDetail.getSeqNo()+";";
			  updateDetailSql.append(tmp); 
		    }
		    System.out.println("Update Details: " + updateDetailSql.toString());
		    int result = dbCommonUtil.execute(conn, updateDetailSql.toString());
		    if(result == -1){
			    System.out.println("Update Details Failed");
			    conn.rollback();
			     return "UPDATE_DETAILS_FAILED";
		    }
		    //#03. add delete items info to sales_detail
		    int seqno = this.getMaxSeqNoOfOrderDetails(conn, order.getShopId(), order.getTranNo());
		    StringBuffer insertDeleteDetails = new StringBuffer();
		    for(OrderDetail orderDetail: lsDeleteOrderDetail){
			   Map<String,String> detailProperty = this.buildOrderDetailProperty(newOrder, orderDetail);
			   //modify seqno, ivoid_status, ivoid_shop, ivoid_pos, ivoid_time, ivoid_by, qty, amount, total_amount
			   seqno++;
			   detailProperty.put("seqno", ""+seqno);
			   detailProperty.put("ivoid_status", "1");
			   detailProperty.put("ivoid_shop", "'"+order.getShopId()+"'");
			   detailProperty.put("ivoid_pos", "'"+order.getPosId()+"'");
			   detailProperty.put("ivoid_time", "GETDATE()");
			   detailProperty.put("ivoid_by", "'"+order.getUserId()+"'");
			   detailProperty.put("qty", "-"+orderDetail.getQty());
			   detailProperty.put("amount", "-"+order.getTotalAmount());
			   detailProperty.put("total_amount", "-"+orderDetail.getPayAmount());
			   String sqlTmp = this.buildInsertSql("[dbo].[sales_details]", detailProperty);
			   insertDeleteDetails.append(sqlTmp);
		    }
		    //append update dept_id and class_id from sales_details
		    insertDeleteDetails.append("update dbo.sales_details set dept_id = b.dept_id, class_id = b.class_id " +
					 " from dbo.item b where b.item_code = code and shop_id='"+order.getShopId() + 
					 "' and pos_id='" + order.getPosId() + "' and tran_no='" + order.getTranNo() + "' "
					 + " and sales_details.dept_id is null " +
					 " and sales_details.class_id is null;");
		    System.out.println("INSERT DETAILED DETAILS: "+insertDeleteDetails.toString());
		    int detail_count = dbCommonUtil.execute(conn, insertDeleteDetails.toString());
		    if(detail_count == -1){
			   System.out.println("Insert 'delete items' info failed.");
			   conn.rollback();
			   return "INSERT_DETAIL_FAILED";
		    }
		   
		    System.out.println("Delete items success.");
		    conn.commit();
		    return "SUCCESS";
		}catch (SQLException e){
			e.printStackTrace();
			try{
				if(conn!=null && !conn.isClosed())
					conn.rollback();
			} catch (SQLException ex){
				ex.printStackTrace();
			}
			return "SQL_ERROR";
		} finally{
			try{
				if(conn != null && !conn.isClosed()){
					conn.setAutoCommit(false);
					conn.close();
				}
			} catch (SQLException ex){
				ex.printStackTrace();
			}
		}
		
	}
}
