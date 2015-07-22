package com.smartmenu.db;

import java.sql.Connection;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DBCommonUtil {
	
	@Autowired
	private DataSource dataSource;
			
	public boolean checkExist(String sql){
		Connection conn=null;
		Statement st=null;
		ResultSet rs=null;
		try {
			conn = dataSource.getConnection();
			st = conn.createStatement();
			rs = st.executeQuery(sql);
			if (rs.next())
				return true;
			else 
				return false;
		} catch (SQLException e) {
			e.printStackTrace();
		} finally{
			try{
				if(rs != null)
					rs.close();
				if(st != null)
					st.close();
				if(conn != null)
					conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		
		return false;
	}
	public boolean checkExist(Connection conn, String sql){
		Statement st=null;
		ResultSet rs=null;
		try {
			st = conn.createStatement();
			rs = st.executeQuery(sql);
			if (rs.next())
				return true;
			else 
				return false;
		} catch (SQLException e) {
			e.printStackTrace();
		} finally{
			try{
				if(rs != null)
					rs.close();
				if(st != null)
					st.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		
		return false;
	}
	
	public List<Object> query(String sql, ParseResultSetInterface parseResultSet){
		Connection conn=null;
		Statement st=null;
		ResultSet rs=null;
		try {
			conn = dataSource.getConnection();
			st = conn.createStatement();
			rs = st.executeQuery(sql);
			List<Object> ls = parseResultSet.parseResult(rs); 
			return ls;
		} catch (SQLException e) {
			e.printStackTrace();
		} finally{
			try{
				if(rs != null)
					rs.close();
				if(st != null)
					st.close();
				if(conn != null)
					conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return null;
	}
	public List<Object> query(Connection conn, String sql, ParseResultSetInterface parseResultSet){

		Statement st=null;
		ResultSet rs=null;
		try {
			st = conn.createStatement();
			rs = st.executeQuery(sql);
			List<Object> ls = parseResultSet.parseResult(rs); 
			return ls;
		} catch (SQLException e) {
			e.printStackTrace();
		} finally{
			try{
				if(rs != null)
					rs.close();
				if(st != null)
					st.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return null;
	}
	public int execute(String sql){
		Connection conn=null;
		Statement st=null;
		try {
			conn = dataSource.getConnection();
			st = conn.createStatement();
			int count = st.executeUpdate(sql);
			return count;
		} catch (SQLException e) {
			e.printStackTrace();
		} finally{
			try{
				if(st != null)
					st.close();
				if(conn != null)
					conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return -1;
	}
	
	public int execute(Connection conn, String sql ){
		Statement st=null;
		try {
			st = conn.createStatement();
			int count = st.executeUpdate(sql);
			return count;
		} catch (SQLException e) {
			e.printStackTrace();
		} finally{
			try{
				if(st != null)
					st.close();
				
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return -1;
	}
}
