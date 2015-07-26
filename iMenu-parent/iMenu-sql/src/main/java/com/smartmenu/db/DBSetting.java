package com.smartmenu.db;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.smartmenu.entity.DeleteReason;
import com.smartmenu.entity.Discount;
import com.smartmenu.entity.ServiceCharge;
import com.smartmenu.entity.Tax;

@Component
public class DBSetting {
	@Autowired
	private DBCommonUtil dbCommonUtil;
	
	public DeleteReason[] getDeleteSettings(){
		String sql = "select code, description1, description2 from [dbo].[void_reason]";
		
		List<Object> lsResult = dbCommonUtil.query(sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				while(rs.next()){
					DeleteReason dr = new DeleteReason();
					dr.setCode(rs.getString("code"));
					dr.setDesc(rs.getString("description1"));
					dr.setDesc2(rs.getString("description2"));
					ls.add(dr);
				}
				return ls;
			}
			
		});
		if(lsResult.size() == 0)
			return null;
		else
			return lsResult.toArray(new DeleteReason[]{});
		
	}
	
	//get shop-id and pos-id by mac
	public String[] getShopIdAndPosId(String mac){
		String sql="select shop_id, pos_id from dbo.device_map where device_id='" + mac + "' and enable=1";
		List<Object> lsResult = dbCommonUtil.query(sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				if(rs.next()){
					String shopId = rs.getString("shop_id");
					String posId = rs.getString("pos_id");
					if(shopId == null && posId == null)
						return null;
					else
					{
						ls.add(shopId);
						ls.add(posId);
					}
				}
				return ls;
			}
		});
		if(lsResult == null || lsResult.size() == 0)
			return null;
		else
			return lsResult.toArray(new String[]{});
		
	}
	
	public ServiceCharge[] getServiceCharge(String tableId, String shopId){
		String sql="select c.id, c.desc1 as desc1, c.desc2 as desc2, c.value , c.charge_type from dbo.[table] a, dbo.section b, dbo.charges c "+
	               " where a.shop_id='"+shopId+"' and a.table_id='"+tableId+"' and a.section_id=b.section_id and b.chg_id=c.id; ";
		List<Object> ls = dbCommonUtil.query(sql, new ParseResultSetInterface(){
			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> lsResult = new ArrayList<Object>();
				if(rs.next()){
                    ServiceCharge sc = new ServiceCharge();
					sc.setId(rs.getString("id"));
					sc.setDesc(rs.getString("desc1"));
					sc.setDesc2(rs.getString("desc2"));
					if(rs.getBigDecimal("value")==null)
						sc.setValue(new BigDecimal(0));
					else
						sc.setValue(rs.getBigDecimal("value"));
                    sc.setType(rs.getInt("charge_type"));
					
					lsResult.add(sc);
					
				}
				return lsResult;
			}
		});
		if(ls==null)
			return null;
		else if(ls.size()==0)
			return new ServiceCharge[]{};
		else
			return ls.toArray(new ServiceCharge[]{});
	}
	
	
	public Tax[] getTaxInfo(String tableId, String shopId){
		String sql = "SELECT a.tax_id, a.value, a.desc1, a.desc2, a.type FROM dbo.tax a, dbo.section b, dbo.[table] c"
				+ "  where c.shop_id='" +shopId + "' and c.table_id='" + tableId + "' "
						+ "and c.section_id = b.section_id and b.tax_id = a.tax_id and a.enabled=1;";
		System.out.println("GetTaxInfo: " + sql.toString());
		List<Object> ls = dbCommonUtil.query(sql, new ParseResultSetInterface(){
			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> lsResult = new ArrayList<Object>();
				if(rs.next()){
                    Tax tax = new Tax();
                    tax.setTaxId(rs.getString("tax_id"));
                    if(rs.getString("value")==null)
                    	tax.setTaxValue(new BigDecimal(0));
                    else
                    	tax.setTaxValue(rs.getBigDecimal("value"));
                    tax.setTaxDesc(rs.getString("desc1"));
                    tax.setTaxDesc2(rs.getString("desc2"));
                    tax.setTaxType(rs.getInt("type"));
					
					lsResult.add(tax);
					
				}
				return lsResult;
			}
		});
		if(ls == null)
			return null;
		else if(ls.size() == 0)
			return new Tax[]{};
		else
			return ls.toArray(new Tax[]{});
	}
	
	public Discount[] getDiscounts(String shopId){
		String sql = "  select id, desc1, desc2, disc_type, value "
				+ " from dbo.discount "
				+ " where shop_id='" + shopId + "' and enable=1";
		List<Object> ls = dbCommonUtil.query(sql, new ParseResultSetInterface(){
			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> lsResult = new ArrayList<Object>();
				while(rs.next()){
					Discount disc = new Discount();
					disc.setDiscId(rs.getString("id"));
					disc.setDiscDesc(rs.getString("desc1"));
					disc.setDiscDesc2(rs.getString("desc2"));
					disc.setDiscType(rs.getInt("disc_type"));
					if(rs.getBigDecimal("value")==null)
						disc.setDiscRate(new BigDecimal(0));
					else
						disc.setDiscRate(rs.getBigDecimal("value"));
					
					lsResult.add(disc);
					
				}
				return lsResult;
			}
		});

		if(ls == null)
			return null;
		else if(ls.size() == 0)
			return new Discount[]{};
		else
			return ls.toArray(new Discount[]{});
	}
}
