package com.smartmenu.filters;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
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

/**
 * Servlet Filter implementation class AccessControlFilter
 */

public class AccessControlFilter implements Filter {
	private static List<String> lsMacs = new ArrayList<String>();
	private int maxClients;
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
		// TODO Auto-generated method stub
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
        
//		long currTime=System.currentTimeMillis();
//		Calendar ca = Calendar.getInstance();
//		ca.set(Calendar.YEAR, 2016);
//		ca.set(Calendar.MONTH, 1);
//		ca.set(Calendar.DAY_OF_MONTH, 1);
//		ca.set(Calendar.HOUR_OF_DAY, 0);
//		ca.set(Calendar.MINUTE, 0);
//		ca.set(Calendar.SECOND, 01);
//		if(currTime<ca.getTimeInMillis()){
//		
//            // pass the request along the filter chain
//			chain.doFilter(request, response);
//		}else{
//			JSONObject json = new JSONObject();
//			json.put("status", 1);
//			json.put("msg", ReturnMsgCode.ACCESS_LIMITED);
//			String callbak=request.getParameter("callback");
//			response.getWriter().write(callbak+"("+json.toString()+")");
//		}
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
		maxClients = Integer.parseInt(fConfig.getInitParameter("maxClients"));
	}

}
