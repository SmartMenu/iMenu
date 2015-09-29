<<<<<<< HEAD
package com.smartmenu.common;

public class SQLEncode {
	public static String encode(String str){
		String result = str.replaceAll("'", "''");
		return result;
	}
}
=======
package com.smartmenu.common;

public class SQLEncode {
  public static String encode(String str)
  {
    String result = str.replaceAll("'", "''");
    return result;
  }
}
>>>>>>> 8fa8359569e10b535f6018a75b3fbd47225ff974
