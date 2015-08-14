package com.smartmenu.db;

import static org.junit.Assert.fail;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.smartmenu.entity.TableInfo;
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations="classpath:WEB-INF/spring/context-db.xml")
public class DBTableTest {

	@Autowired
	private DBTable dbTable;
	
	@Test
	public void testCheckTableId() {
//		fail("Not yet implemented");
	}

	@Test
	public void testGetTables() {
		TableInfo[] tb = dbTable.getTables("D01");
		System.out.println(tb.length);
	}

	@Test
	public void testGetServiceCharge() {
//		fail("Not yet implemented");
	}

}
