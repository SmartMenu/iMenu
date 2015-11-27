package com.smartmenu.filters;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSONObject;

import com.smartmenu.utils.ReturnMsgCode;
import com.smartmenu.utils.SmartCheck;

/**
 * Servlet Filter implementation class AccessControlFilter
 */

public class AccessControlFilter implements Filter {
	private static List<String> lsMacs = new ArrayList<String>();
	private int maxClients;
	private long firstUseTime;
	private long endUseTime;
	private boolean checkLicenseFlag=false;
    public int getMaxClients() {
		return maxClients;
	}

	public void setMaxClients(int maxClients) {
		this.maxClients = maxClients;
	}

	/**
     * Default constructor. 
     */
    public AccessControlFilter() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		long currTime=System.currentTimeMillis();
		if(!this.checkLicenseFlag || currTime<this.firstUseTime || currTime>this.endUseTime){
			//重新检查license
			SmartCheck checker = SmartCheck.getInstanse();
			this.checkLicenseFlag = checker.checkLicense();
			this.firstUseTime = checker.getFirstUseTime();
			this.endUseTime = checker.getEndtime();
			this.maxClients = checker.getConnector();
			
			if(!this.checkLicenseFlag || currTime<this.firstUseTime || currTime>this.endUseTime){
				JSONObject json = new JSONObject();
				json.put("status", 1);
				json.put("msg", ReturnMsgCode.LICENSE_INVALID);
				String callbak=request.getParameter("callback");
				response.getWriter().write(callbak+"("+json.toString()+")");
				return;
			}
		}
		HttpServletRequest httpRequest = (HttpServletRequest)request;  
        String url = httpRequest.getRequestURI();  
        String mac = request.getParameter("mac");
        String tMac = null;
        synchronized(lsMacs){
	        for(String temp: lsMacs){
	        	if(temp.equalsIgnoreCase(mac)){
	        		tMac = temp;
	        		break;
	        	}
	        }
	        //logout
	        if(url.contains("logout") && tMac!=null){
	        	lsMacs.remove(tMac);
	        	JSONObject json = new JSONObject();
				json.put("status", 0);
				json.put("msg", ReturnMsgCode.SUCCESS);
				String callbak=request.getParameter("callback");
				response.getWriter().write(callbak+"("+json.toString()+")");
				return;
	        }
	        
	        //others
	        if(tMac==null && lsMacs.size()+1 > maxClients ){
	        	JSONObject json = new JSONObject();
				json.put("status", 1);
				json.put("msg", ReturnMsgCode.ACCESS_LIMITED);
				String callbak=request.getParameter("callback");
				response.getWriter().write(callbak+"("+json.toString()+")");
				return;
	        }
	        if(tMac==null && lsMacs.size()+1 <= maxClients){
	        	lsMacs.add(mac);
	        }
	        // pass the request along the filter chain
			chain.doFilter(request, response);
        }
       
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		//maxClients = Integer.parseInt(fConfig.getInitParameter("maxClients"));
		SmartCheck checker = SmartCheck.getInstanse();
		this.checkLicenseFlag = checker.checkLicense();
		this.firstUseTime = checker.getFirstUseTime();
		this.endUseTime = checker.getEndtime();
		this.maxClients = checker.getConnector();
	}

}
