package com.smartmenu.db;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.smartmenu.entity.TableInfo;
@Component
public class DBTable{
	@Autowired
	private DBCommonUtil dbCommonUtil;
	//check whether the table is valid
	public boolean checkTableId(String tableId, String shopId){
		String sql="select top 1 [shop_id], [table_id] from [dbo].[table] " +
	               " where shop_id='" + shopId + "' and table_id='" + tableId + "';";
		return dbCommonUtil.checkExist(sql);
	}
	//get all tables
	public TableInfo[] getTables(String shopId){
		String sql="select a.table_id, c.name1 as floor_desc, c.name2 as floor_desc2, a.max_cover, case when b.cover is null then 0 else b.cover end as cover, "
				+ " case when b.operation_status is null then 0 else b.operation_status end as status, "
				+ " b.create_date, "
				+ " case when b.total_amount is null then 0 else b.total_amount end as total_amount "
				+ " from dbo.[table] a"
				+ " join dbo.section c"
				+ " on a.section_id = c.section_id  and a.shop_id = c.shop_id"
				+ " left join ("
				+ " select * from dbo.table_status "
				+ " where DATEDIFF(DD, status_time, GETDATE())=0 ) b"
				+ " on a.table_id = b.table_id and a.shop_id = b.shop_id"
				+ " where a.shop_id='" + shopId + "';";
		
		System.out.println("GetTableSQL:"+sql.toString());
		List<Object> lsResult = dbCommonUtil.query(sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				while(rs.next()){
					TableInfo tbInfo = new TableInfo();
					tbInfo.setTableId(rs.getString("table_id"));
					tbInfo.setFloorDesc(rs.getString("floor_desc"));
					tbInfo.setFloorDesc2(rs.getString("floor_desc2"));
					tbInfo.setMaxChairs(rs.getInt("max_cover"));
					tbInfo.setStatus(rs.getInt("status"));
					tbInfo.setOpenChairs(rs.getInt("cover"));
					if(rs.getTimestamp("create_date") == null)
						tbInfo.setOpenTime(null);
					else
						tbInfo.setOpenTime(rs.getTimestamp("create_date"));
					if(rs.getBigDecimal("total_amount") == null)
						tbInfo.setOpenAmount(null);
					else
						tbInfo.setOpenAmount(rs.getBigDecimal("total_amount"));
					
					ls.add(tbInfo);
				}
				if(ls==null || ls.size() == 0)
					return null;
				else 
					return ls;
				
			}
			
		});
		if(lsResult == null || lsResult.size() == 0)
			return new TableInfo[]{};
		return lsResult.toArray(new TableInfo[]{});
	}
	
	public String getSectionId(String shopId, String tableId){
		String sql="select section_id from dbo.[table] "
				+ " where shop_id='" + shopId + "' and table_id='" + tableId + "';";
		
		List<Object> lsResult = dbCommonUtil.query(sql, new ParseResultSetInterface(){

			@Override
			public List<Object> parseResult(ResultSet rs) throws SQLException {
				List<Object> ls = new ArrayList<Object>();
				if(rs.next()){
					String sectionId = rs.getString("section_id");
					ls.add(sectionId);
				}
				if(ls==null || ls.size() == 0)
					return null;
				else 
					return ls;
				
			}
			
		});
		if(lsResult == null || lsResult.size() == 0)
			return null;
		String sectionId = (String)lsResult.get(0);
		
		return sectionId;
	}

}
