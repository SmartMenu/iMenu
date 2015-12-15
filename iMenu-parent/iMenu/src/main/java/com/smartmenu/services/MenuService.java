package com.smartmenu.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartmenu.db.DBMenu;
import com.smartmenu.entity.Item;
import com.smartmenu.entity.ItemState;
import com.smartmenu.entity.LookupCategory;
import com.smartmenu.entity.LookupDetail;
import com.smartmenu.entity.LookupHeader;
import com.smartmenu.menu.Lookup;
import com.smartmenu.menu.item.BasicItem;
import com.smartmenu.menu.item.SetItem;
import com.smartmenu.menu.item.SimpleItem;
import com.smartmenu.menu.modifier.Modifier;
import com.smartmenu.menu.modifier.ModifierContainer;
import com.smartmenu.menu.modifier.ModifierDetail;
import com.smartmenu.menu.setter.Setter;
import com.smartmenu.menu.setter.SetterContainer;
import com.smartmenu.menu.setter.SetterDetail;
import com.smartmenu.utils.ReturnMsgCode;

@Service
public class MenuService {
	@Autowired
	private DBMenu dbMenu;
	private static Logger log = Logger.getLogger(MenuService.class);
	public JSONObject getMenu(String shopId, String posId, String deviceId){
		JSONObject json = new JSONObject();
		JSONArray jaData = new JSONArray();
		
		List<Lookup> ls = this.organizeItem(shopId, posId, deviceId);
		if(ls==null || ls.size()==0){
			
			json.put("status", 1);
			json.put("msg", "MENU_IS_NULL");
			json.put("data", "");
			return json;
		}
		for(Lookup lookup: ls){
			JSONObject jLc = new JSONObject();
			jLc.put("lookup-id", lookup.getLookupId());
			jLc.put("lookup-name", lookup.getLookupName());
			jLc.put("lookup-name2", lookup.getLookupName2());
			jLc.put("lookup-type", lookup.getLookupType());
			jLc.put("picture-type", lookup.getPictureType());
			List<BasicItem> lsItems = lookup.getLsItems();
			
			JSONArray jaItems = new JSONArray();
			if(lsItems!=null){
				for(BasicItem bi:lsItems){
					JSONObject jItem = bi.toJson();
					jaItems.add(jItem);
				}
			}
			jLc.put("items", jaItems);				
			jaData.add(jLc);
		}
		json.put("status", 0);
		json.put("msg", "SUCCESS");
		json.put("data", jaData);
		
		return json;
	}
	private List<Lookup> organizeItem(String shopId, String posId, String deviceId){
		Item[] items = dbMenu.getItems(shopId);

		Map<String, Item> mapItem=new HashMap<String, Item>();
		if(items!=null){
			for(Item item: items){
				mapItem.put(item.getItemId(), item);
			}
		}
		LookupHeader[] setters = dbMenu.getSetterLookup(shopId);
		Map<String, SetterContainer> mapSetter = new HashMap<String, SetterContainer>();
		if(setters != null){
			for(LookupHeader sLH: setters){
				SetterContainer setter = new SetterContainer();
				setter.setId(sLH.getLookupId());
				setter.setName(sLH.getLookupName());
				setter.setName2(sLH.getLookupName2());
				setter.setMinCount(sLH.getMinCount());
				setter.setMaxCount(sLH.getMaxCount());
				setter.setCompulsory(sLH.getCompulsory());
				setter.setDefaultSelectAll(sLH.isDefaultSelectAll());
				mapSetter.put(setter.getId(), setter);
			}
		}
		LookupHeader[] modifiers = dbMenu.getModifierLookup(shopId);
		Map<String, ModifierContainer> mapModifier = new HashMap<String, ModifierContainer>();
		if(modifiers!=null){
			for(LookupHeader mLH: modifiers){
				ModifierContainer modifier = new ModifierContainer();
				modifier.setId(mLH.getLookupId());
				modifier.setName(mLH.getLookupName());
				modifier.setName2(mLH.getLookupName2());
				modifier.setMaxCount(mLH.getMaxCount());
				modifier.setMinCount(mLH.getMinCount());
				modifier.setCompulsory(mLH.getCompulsory());
				
				mapModifier.put(modifier.getId(), modifier);
			}
		}
		LookupCategory[] shownLookups = dbMenu.getShownLookup(shopId, posId, deviceId);
		Map<String, LookupCategory> mapShownLookup = new HashMap<String, LookupCategory>();
		if(shownLookups!=null){
			for(LookupCategory lc: shownLookups){
				mapShownLookup.put(lc.getLookupId(), lc);
			}
		}
		Map<String, BasicItem> newMapBasicItem = new HashMap<String, BasicItem>();
		Map<String, Lookup> mapLookup = new HashMap<String, Lookup>();
		
		LookupDetail[] lookupDetails = dbMenu.getLookupDetail(shopId);
		if(lookupDetails == null)
			return null;
		Map<String, Map<String, Integer>> mapSeq = new HashMap<String, Map<String, Integer>>();
		for(LookupDetail lookupDetail: lookupDetails){
			String lookupId = lookupDetail.getLookupId();
			int lookupType = lookupDetail.getLookupType();
			int itemType = lookupDetail.getItemType();
			String code = lookupDetail.getCode();
			//int seq = lookupDetail.getSeq();
			Map<String, Integer> subMap;
			if(mapSeq.containsKey(lookupId)){
				subMap = mapSeq.get(lookupId);
			}else{
				subMap = new HashMap<String, Integer>();
				mapSeq.put(lookupId, subMap);
			}
			subMap.put(code, lookupDetail.getSeq());
			if(lookupType == LookupDetail.MODIFIER_FLAG_FOR_LOOKUPTYPE && mapModifier.containsKey(lookupId)){
				ModifierContainer m = mapModifier.get(lookupId);
				if(itemType==LookupDetail.ITEM_FLAG_FOR_ITEMTYPE && mapItem.containsKey(code)){
					ModifierDetail md = new ModifierDetail();
					Item item = mapItem.get(code);
					md.setId(item.getItemId());
					md.setName(item.getItemName());
					md.setName2(item.getItemName2());
					md.setPrice(item.getItemPrice());
					//md.setSeq(seq);
					m.addModifier(md);
				}else if(itemType==LookupDetail.GROUP_FLAG_FOR_ITEMTYPE && mapModifier.containsKey(code)){
					ModifierContainer mc = mapModifier.get(code);
					m.addModifier(mc);
				}
			}else if(lookupType== LookupDetail.SETTER_FLAG_FOR_LOOKUPTYPE && mapSetter.containsKey(lookupId)){
				SetterContainer sc = mapSetter.get(lookupId);
				if(itemType==LookupDetail.ITEM_FLAG_FOR_ITEMTYPE && mapItem.containsKey(code)){
					SimpleItem si;
					Item item = mapItem.get(code);
					if(newMapBasicItem.containsKey(code)){
						BasicItem bi = newMapBasicItem.get(code);
						if(bi instanceof SimpleItem){
							si = (SimpleItem) bi;
						}else{
							log.info("ERROR: menu unstanding error");
							continue;
						}
					}else{
						si = new SimpleItem(item);
						if(item.getModifierId() != null && item.getModifierId().trim().length()!=0){
							ModifierContainer tmpMc = new ModifierContainer();
							tmpMc.setId(item.getModifierId());
							si.setModifier(tmpMc);
						}
						newMapBasicItem.put(si.getItemId(), si);
					}
						
					SetterDetail sd = new SetterDetail(si);
					sc.addSetter(sd);
				}else if(itemType==LookupDetail.GROUP_FLAG_FOR_ITEMTYPE && mapSetter.containsKey(code)){
					SetterContainer subSc = mapSetter.get(code);
					sc.addSetter(subSc);
				}else if(itemType==LookupDetail.GROUP_FLAG_FOR_ITEMTYPE && mapModifier.containsKey(code)){
					ModifierContainer subMc = mapModifier.get(code);
					sc.addSetter(subMc);
				}
			}else if(lookupType == LookupDetail.NORMAL_FLAG_FOR_LOOKUPTYPE && mapShownLookup.containsKey(lookupId)){
				Lookup lookup;
				if(mapLookup.containsKey(lookupId))
					lookup = mapLookup.get(lookupId);
				else{
					LookupCategory lc = mapShownLookup.get(lookupId);
					lookup = new Lookup(lc);
					mapLookup.put(lookup.getLookupId(), lookup);
				}
								
				if(itemType == LookupDetail.ITEM_FLAG_FOR_ITEMTYPE && mapItem.containsKey(code)){
					Item item = mapItem.get(code);
					BasicItem bi; 
					if(newMapBasicItem.containsKey(code)){
						bi = newMapBasicItem.get(code);
					}
					else{
						if(item.getSetId() == null || item.getSetId().trim().length() == 0){
							SimpleItem si = new SimpleItem(item);
							if(item.getModifierId() != null && item.getModifierId().trim().length()!=0){
								ModifierContainer tmpMc = new ModifierContainer();
								tmpMc.setId(item.getModifierId());
								si.setModifier(tmpMc);
							}
							bi = si;
						}
						else{
							SetItem setItem = new SetItem(item);
							SetterContainer tmpSc = new SetterContainer();
							tmpSc.setId(item.getSetId());
							setItem.setSetter(tmpSc);
							bi = setItem;
						} 
						newMapBasicItem.put(bi.getItemId(), bi);
					}
					lookup.addItem(bi);
				}
			}
		}
		//
		for(String itemId: newMapBasicItem.keySet()){
			BasicItem bi = newMapBasicItem.get(itemId);
			if(bi instanceof SimpleItem){
				SimpleItem si = (SimpleItem)bi;
				if(si.getModifier()!=null){
					String modifierId = si.getModifier().getId();
					if(mapModifier.containsKey(modifierId)){
						ModifierContainer oldMC = mapModifier.get(modifierId);
						ModifierContainer newMC = oldMC.deepClone();
						if(newMC == null)
							si.setModifier(mapModifier.get(modifierId));
						else{
							this.setModifierSeqByLoop(si.getItemId(), newMC, mapSeq);
							si.setModifier(newMC);
						}
					}
					else
						si.setModifier(null);
				}
			}
			if(bi instanceof SetItem){
				SetItem si = (SetItem)bi;
				//if(si.getItemId().equalsIgnoreCase("0S1"))
				//	System.out.println("Stop");
				if(si.getSetter()!=null){
					String setterId = si.getSetter().getId();
					if(mapSetter.containsKey(setterId)){
						SetterContainer oldSC = mapSetter.get(setterId);
						SetterContainer newSC = oldSC.deepClone();
						if(newSC == null)	
							si.setSetter(mapSetter.get(setterId));
						else{
							this.setSetterSeqByLoop(si.getItemId(), newSC, mapSeq);
							si.setSetter(newSC);
						}
					}
					else
						si.setSetter(null);
				}
			}
		}
		if(shownLookups == null)
			return null;
		List<Lookup> lsResult = new ArrayList<Lookup>();
		for(LookupCategory lc : shownLookups){
			String lookupId = lc.getLookupId();
			if(mapLookup.containsKey(lookupId)){
				Lookup lookup = mapLookup.get(lookupId);
				lsResult.add(lookup);
			}
		}

		return lsResult;
	}
// 循环设置modifier的seq
	private void setModifierSeqByLoop(String header, Modifier altM, Map<String,Map<String, Integer>> mapSeq){
		Map<String, Integer> map=mapSeq.get(header);
		if(map!=null&&map.containsKey(altM.getId())){
			int seq = map.get(altM.getId());
			altM.setSeq(seq);
		}
		if(altM instanceof ModifierDetail){
			return;
		}else if(altM instanceof ModifierContainer){
			ModifierContainer mc = (ModifierContainer)altM;
			List<Modifier> ls = mc.getLsModifiers();
			for(Modifier subM: ls){
				setModifierSeqByLoop(altM.getId(), subM, mapSeq);
			}
		}
	}
//循环管设置setter的detail	
	private void setSetterSeqByLoop(String header, Setter altS, Map<String, Map<String, Integer>> mapSeq){
		Map<String, Integer> map=mapSeq.get(header);
		if(map!=null&&map.containsKey(altS.getId())){
			int seq = map.get(altS.getId());
			altS.setSeq(seq);
		}
		if(altS instanceof SetterDetail){
			return;
		}else if(altS instanceof Modifier){
			setModifierSeqByLoop(header, (Modifier)altS, mapSeq);
		}else if(altS instanceof SetterContainer){
			SetterContainer sc = (SetterContainer)altS;
			List<Setter> ls = sc.getLsSetters();
			for(Setter subS : ls){
				setSetterSeqByLoop(altS.getId(), subS, mapSeq);
			}
		}
	}
	
	public JSONObject getItemSoldoutInfo(String shopId){
		JSONObject json = new JSONObject();
		String msg;
		JSONArray jaData = new JSONArray();
		
		ItemState[] itemStates = dbMenu.getItemStates(shopId);
		int status=0;
		if(itemStates==null){
			status=1;
			msg = ReturnMsgCode.DATA_ERROR;
			json.put("status", status);
			json.put("msg", msg);
			return json;
		}else if (itemStates.length==0){
			status=0;
			msg = ReturnMsgCode.DATA_IS_NULL;
			json.put("status", status);
			json.put("msg", msg);
			return json;
		}else{
			status=0;
			msg = ReturnMsgCode.SUCCESS;
		}
				
		for(ItemState itemState: itemStates){
			JSONObject jIS = new JSONObject();
			jIS.put("item-id", itemState.getItemId());
			if(itemState.getSoldoutBal()==null)
				jIS.put("soldout-bal", 0);
			else{
				jIS.put("soldout-bal", itemState.getSoldoutBal().intValue());
			}
			jIS.put("soldout-flag", itemState.getSoldoutFlag());
			jaData.add("jIS");
		}
		json.put("status", status);
		json.put("msg", msg);
		json.put("data", jaData);
		return json;
	}
	
}
