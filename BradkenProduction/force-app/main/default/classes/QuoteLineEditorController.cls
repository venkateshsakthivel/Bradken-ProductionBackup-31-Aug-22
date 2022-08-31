/**
* @author: Tquila dev
* @Used for: controller for QuoteLineEditor  
* @description:  
* @TestClass: QuoteLineEditorControllerTest
* @History : 
*/ 
public class QuoteLineEditorController {
	private static ResponseMessage response;
    
    //Get quote details
    @auraEnabled
    public static Quote getQuoteDetails(String quoteId) {
        string query ='';
        query += ' SELECT '+sObjectUtil.getAllFields('Quote')+',Opportunity.CurrencyIsoCode';
        query += ' FROM Quote';
		query += ' WHERE Id=:quoteId';
        query += ' LIMIT 1';
        system.debug('QuoteQuery'+query);
        return database.query(query);
    }
    
    //TODO - get the Pricebook from the custom object related to account
    @auraEnabled
    public static list<Pricebook2> getPricebooks(String accountId) {
        
        //get customer pricebook
        string cpbquery = '';
        cpbquery += ' SELECT '+sObjectUtil.getAllFields('Customer_Pricebook__c');
        cpbquery += ' , '+sObjectUtil.getAllParentFields('Pricebook2','Price_Book__r');
        cpbquery += ' FROM Customer_Pricebook__c';
		cpbquery += ' WHERE Account__c=:accountId';
        cpbquery += ' LIMIT 100';
		system.debug('cpbquery'+cpbquery);
        list<Customer_Pricebook__c> customerPicebooks =  database.query(cpbquery);
        list<Id> pbIds = new list<Id>();
        for(Customer_Pricebook__c cp : customerPicebooks){
            pbIds.add(cp.Price_Book__c);
        }
        //get pricebook
        string pbquery = '';
        pbquery += ' SELECT '+sObjectUtil.getAllFields('Pricebook2');
        pbquery += ' FROM Pricebook2';
        pbquery += ' WHERE IsActive = true';
        pbquery += ' AND IsStandard = false';
        pbquery += ' AND Id IN : pbIds';
        system.debug('pbquery'+pbquery);
        list<Pricebook2> pricebooks = database.query(pbquery);
        
        //get standard pricebook
        pbquery = '';
        pbquery += ' SELECT '+sObjectUtil.getAllFields('Pricebook2');
        pbquery += ' FROM Pricebook2';
        pbquery += ' WHERE IsActive = true';
        pbquery += ' AND IsStandard = true';
        pbquery += ' LIMIT 1';
        system.debug('pbquery'+pbquery);
        list<Pricebook2> standardPB = database.query(pbquery);
        
        if(!standardPB.isEmpty()) pricebooks.add(standardPB.get(0));
        if(Test.isRunningTest()) pricebooks.add(new Pricebook2(Id = Test.getStandardPricebookId()));
        return pricebooks;
    }
    
    //Query for product codes and pricebookentries from quote's pricebook
	@auraEnabled
	public static list<PricebookEntry> getProducts(String keyword,String pricebookId, String currencyIsoCode){
       if(string.isBlank(keyword)) return null;
        string pbequery = '';
        pbequery += ' SELECT '+sObjectUtil.getAllFields('PricebookEntry');
		pbequery += ' , '+sObjectUtil.getAllParentFields('Product2','Product2');
        pbequery += ' FROM PricebookEntry';
        pbequery += ' WHERE IsActive= true';
		pbequery += ' AND  CurrencyIsoCode =: currencyIsoCode ';
		pbequery += ' AND  Pricebook2Id =: pricebookId ';
        pbequery += ' AND (Name like : keyword';
        pbequery += ' OR Product2.Description like : keyword) ';
        pbequery += ' LIMIT 1000';
        system.debug('pbequery'+pbequery);
		return database.query(pbequery);
    }
    
    @auraEnabled
	public static list<Customer_Product__c> getCustomerProducts(String keyword,String accountId){
       if(string.isBlank(keyword)) return null;
        string cpQuery = '';
        cpQuery += ' SELECT '+sObjectUtil.getAllFields('Customer_Product__c');
		cpQuery += ' , '+sObjectUtil.getAllParentFields('Product2','Product__r');
        cpQuery += ' FROM Customer_Product__c';
        cpQuery += ' WHERE Account__c =:accountId';
        cpQuery += ' AND (Product__r.Name like : keyword';
        cpQuery += ' OR Customer_Product_Description__c  like : keyword';
        cpQuery += ' OR Name like : keyword';
        cpQuery += ' OR Product__r.Description like:keyword) ';
        cpQuery += ' AND Product__r.isActive = true ';
        cpQuery += ' LIMIT 1000';
        system.debug('cpQuery'+cpQuery);
		return database.query(cpQuery);
    }
    
    @auraEnabled
	public static string searchProducts(String keyword,String pricebookId,String accountId,String currencyIsoCode){
        if(string.isBlank(keyword)) return null;
        keyword = '%'+keyword+'%';
        
        list<String> productIds = new list<String>();
        list<String> customerProductIds = new list<String>();

        //Query 1 - All pricebook entries
        list<PricebookEntry> priceBookEntries = getProducts(keyword,pricebookId,currencyIsoCode);
        for(PricebookEntry pbe:priceBookEntries){
            productIds.add(pbe.Product2Id);
        }
        //Query 2 + 1 - Customer Products
		list<Customer_Product__c> customerProducts = getCustomerProducts(keyword,accountId);
        if(customerProducts != null){
            for(Customer_Product__c cp: customerProducts){
                customerProductIds.add(cp.Product__c);
            }
        }
        list<PricebookEntry> customerPriceBookEntries;
        if(!customerProductIds.isEmpty()){
		    productIds.addAll(customerProductIds);
            string cpbequery = '';
            cpbequery += ' SELECT '+sObjectUtil.getAllFields('PricebookEntry');
            cpbequery += ' , '+sObjectUtil.getAllParentFields('Product2','Product2');
            cpbequery += ' FROM PricebookEntry';
            cpbequery += ' WHERE IsActive= true';
            cpbequery += ' AND  Pricebook2Id =: pricebookId ';
            cpbequery += ' AND  Product2Id IN: customerProductIds ';
            cpbequery += ' AND  CurrencyIsoCode =: currencyIsoCode ';
            cpbequery += ' LIMIT 1000';
            system.debug('cpbequery'+cpbequery);
            customerPriceBookEntries = database.query(cpbequery);
        }
        //Query 3
        string orderItems = getOrderItems(productIds,accountId);
        return JSON.serialize((new map<String,Object>{'orderItems' => orderItems,
            										  'priceBookEntries'=>priceBookEntries,
            										  'customerPriceBookEntries'=>customerPriceBookEntries,
            										  'customerProducts' => customerProducts}));
    }
    
    @auraEnabled
	public static String getOrderItems(list<String> productIds,String accountId){
       map<String,OrderItem> productOrderItemMap = new map<String,OrderItem>();
        string orderItemQuery = '';
        orderItemQuery += ' SELECT '+sObjectUtil.getAllFields('OrderItem');
        orderItemQuery += ' FROM OrderItem';
        orderItemQuery += ' WHERE Product2Id IN: productIds ';
        orderItemQuery += ' AND  order.AccountId =:accountId ';
        orderItemQuery += ' AND Invoiced_Date__c != null';
        orderItemQuery += ' ORDER BY Invoiced_Date__c DESC';
        system.debug('orderItemQuery'+orderItemQuery);
        list<OrderItem> orderItems = database.query(orderItemQuery);
        for(OrderItem oi: orderItems){
            if(productOrderItemMap.get(oi.Product2Id) == null){
            	productOrderItemMap.put(oi.Product2Id,oi);
            }
        }
		return JSON.serialize(productOrderItemMap);
    }
    
    //get existing quotelines
	@auraEnabled
    public static list<QuoteLineItem> getQuoteLineItems(String quoteId) {
        string qliquery ='';
        qliquery += ' SELECT '+sObjectUtil.getAllFields('QuoteLineItem');
		qliquery += ' , '+sObjectUtil.getAllParentFields('Product2','Product2');
        qliquery += ', quote.status,quote.Sub_Status__c ';
        qliquery += ' FROM QuoteLineItem';
		qliquery += ' WHERE QuoteId=:quoteId';
		qliquery += ' ORDER BY LineNumber';
        system.debug('QuoteLineItemQuery'+qliquery);
        return database.query(qliquery);
    }
    
   
	
    //get editor config
    @auraEnabled
    public static list<QuoteLineEditor__mdt> getQuoteLineEditorConfig() {
        string configQuery ='';
        configQuery += ' SELECT '+sObjectUtil.getAllFields('QuoteLineEditor__mdt');
        configQuery += ' FROM QuoteLineEditor__mdt';
        configQuery += ' ORDER BY SortOrder__c';
        system.debug('configQuery'+configQuery);
        return database.query(configQuery);
    }

    //Get quoteline Field properties
    @auraEnabled
    public static string getQuoteLineFieldDescribe(){
        return JSON.serialize(sObjectUtil.getFieldDescribeList('QuoteLineItem'));
    }
    
    //update quote on pricebook change
    @auraEnabled
    public static string updateQuotePricebook(Quote quote){
        savepoint sp;
        try{
            //delete exisiting lines
            sp = database.setSavepoint();
            list<QuoteLineItem> quoteLineItemToDelete = getQuoteLineItems(quote.Id);
            if(!quoteLineItemToDelete.isEmpty()){
            	delete quoteLineItemToDelete;
            }
            //update quote
            update quote;
            response = new ResponseMessage('',true) ;
        }catch(exception e){
			if(sp != null) database.rollback(sp);
            response = new ResponseMessage(e.getMessage(),false);
        }
        return JSON.serialize(response);
    }
    
    //save quote lines
    @auraEnabled
    public static string saveQuoteLines(list<QuoteLineItem> quoteLineItemsToSave,List<string> quoteLineIdsToDelete){
        
        
        
        savepoint sp;
        
        try{
            sp = database.setSavepoint();
            
            //delete qli
            list<QuoteLineItem> quoteLineItemToDelete = new list<QuoteLineItem>();
            if(!quoteLineIdsToDelete.isEmpty()){
                quoteLineIdsToDelete = new list<String>(new set<String>(quoteLineIdsToDelete));
                for(String qId : quoteLineIdsToDelete){
                    quoteLineItemToDelete.add(new QuoteLineItem(Id = qId));
                }
            }
            if(!quoteLineItemToDelete.isEmpty()){
            	delete quoteLineItemToDelete;
            }
            
            //insert / update qli
            if(!quoteLineItemsToSave.isEmpty()){
        		upsert quoteLineItemsToSave;
            }
            response = new ResponseMessage(json.serialize(quoteLineItemsToSave),true) ;
        }catch(exception e){
			if(sp != null) database.rollback(sp);
            system.debug('error' + e.getMessage());
            
            //:FC:QLE Change for ProductInactive://
            if (e.getMessage().indexOf('Products are inactive, Cannot add QLI') != -1) 
                response = new ResponseMessage(' for more info. Primary error : Products are inactive, Cannot add to quote.',false);
			else  response = new ResponseMessage(e.getMessage(),false);
            
            System.debug(response);
			
           
            //response = new ResponseMessage(e.getMessage(),false);
        }
        return JSON.serialize(response);
    }

    @AuraEnabled
    public static List<QuoteLineItem> calculateProductAndFreightCosts(List<QuoteLineItem> quoteLineItems){
        List<quotelineitem> updatedQuoteLines = new List<quotelineitem>();
        try{
        	Set<String> SupplierIds = new Set<String>();
            Set<Id> WarehouseIds = new Set<Id>();
            Set<String> productIds = new Set<String>();
            for(quoteLineItem qli: quoteLineItems){
                productIds.add(qli.product2Id);
                WarehouseIds.add(qli.Despatch_Warehouse__c);
                SupplierIds.add(qli.Supplier__c);
            }
            //get default iso code, opportunity iso code, supply warehouse and warehouse id
            CurrencyType ct = [SELECT IsoCode FROM CurrencyType WHERE IsCorporate = true];
            String orgCurrency = ct.IsoCode;
            Quote q = [SELECT id, Opportunity.currencyIsoCode FROM Quote WHERE Id = :quoteLineItems[0].QuoteId];
            String OppCurrencyIsoCode = q.Opportunity.currencyIsoCode;
    
            List<Product2> productList = [SELECT Name, weight__c, (SELECT Id, Cost__c, Part_number__c, Last_Updated_Date__c, CurrencyIsoCode, Supply_Warehouse__c  
                                                                   FROM Unibis_Products_Cost__r
                                                                   WHERE Supply_Warehouse__c IN :SupplierIds) 
                                          FROM Product2
                                          WHERE Id IN :productIds];
            
            Map<String, Product2> productMap = new Map<String, Product2>();
            for(product2 prod: productList){
                productMap.put(prod.Id, prod);
            }
        
        	for(quoteLineItem qli: quoteLineItems){
                //no product cost found
                //TODO fix this
                
                //set values defaults to 0
                qli.product_cost__c = 0.00;
                qli.freight_cost__c = 0.00;
                qli.Unit_Freight_Cost__c = 0.00;
                if(productMap.get(qli.product2Id) == null || productMap.get(qli.product2Id).Unibis_Products_Cost__r.size() == 0){
                    qli.product_cost__c = 0.00;
					qli.Last_Updated_Date__c = null;
                    updatedQuoteLines.add(qli);
                    qli.Product_Cost_Rate__c  = getExchangeRates( 'AUD',OppCurrencyIsoCode);
                    continue;
                }
                else{
                    for(Unibis_Product_Cost__c upc : productMap.get(qli.product2Id).Unibis_Products_Cost__r){
                        
                        if(upc.Supply_Warehouse__c == qli.Supplier__c){
                            //product cost and qli are same iso code
                            if(upc.currencyIsoCode == OppCurrencyIsoCode){
                                qli.product_cost__c = upc.cost__c;
                                qli.Last_updated_Date__c = upc.Last_Updated_Date__c;
                                qli.Product_Cost_Rate__c = getExchangeRates( upc.CurrencyIsoCode,OppCurrencyIsoCode);
                            }
                            else{
                                //conversion is to org currency
                                if(OppCurrencyIsoCode == orgCurrency){
                                    qli.product_cost__c = currencyUtil.convertToOrgCurrency(upc.cost__c, 
                                                                                            upc.currencyIsoCode, 
                                                                                            Date.today());
                                    qli.Last_updated_Date__c = upc.Last_Updated_Date__c;
                                    qli.Product_Cost_Rate__c = getExchangeRates( upc.CurrencyIsoCode,OppCurrencyIsoCode);
                                }
                                else{
                                    qli.product_cost__c = currencyUtil.convertToNonOrgCurrency(upc.cost__c, 
                                                                                                upc.currencyIsoCode, 
                                                                                                OppCurrencyIsoCode, 
                                                                                                Date.Today());
                                    qli.Last_updated_Date__c = upc.Last_Updated_Date__c;
                                    qli.Product_Cost_Rate__c = getExchangeRates( upc.CurrencyIsoCode,OppCurrencyIsoCode);
                                }
                            }
                        }
                    }
                    updatedQuoteLines.add(qli);
            }
        	}

        	List<Unibis_Freight_Cost__c> freightCostList = [SELECT Id, rate__c, currencyIsoCode, DespatchWH__c, Supply_Warehouse__c
                                                        FROM unibis_freight_cost__c
                                                        WHERE DespatchWH__c IN :warehouseIds
                                                        AND Supply_Warehouse__c IN :SupplierIds
                                                        AND DespatchWH__c != null
                                                        AND Supply_Warehouse__c != null
                                                       ];
            Map<Id, List<Unibis_Freight_Cost__c>> freightCostMap = new Map<Id, List<Unibis_Freight_Cost__c>>();
            for(unibis_freight_cost__c ufc : freightCostList){
                if(freightCostMap.containsKey(ufc.DespatchWH__c)){
                    freightCostMap.get(ufc.DespatchWH__c).add(ufc);
                }
                else{
                    freightCostMap.put(ufc.DespatchWH__c, new List<unibis_freight_cost__c>());
                    freightCostMap.get(ufc.DespatchWH__c).add(ufc);
                }
            }
            for(quotelineitem qli : updatedQuoteLines){
                if(freightCostMap.get(qli.Despatch_Warehouse__c) == null){
                    qli.freight_cost__c = 0.00;
                    qli.Unit_Freight_Cost__c = 0.00;
                    qli.Freight_Cost_Rate__c = getExchangeRates( 'AUD',OppCurrencyIsoCode);
                }
                else{
                    if(freightCostMap.get(qli.Despatch_Warehouse__c).size() > 0){
                        for(unibis_freight_cost__c fc : freightCostMap.get(qli.Despatch_Warehouse__c)){
                            if(fc.Supply_Warehouse__c == qli.Supplier__c){
                                //freight and opp iso are same
                                if(productMap.get(qli.product2Id) != null && fc.currencyIsoCode == OppCurrencyIsoCode && productMap.get(qli.product2Id).weight__c != null){
                                    qli.freight_cost__c = Decimal.valueOf(productMap.get(qli.product2Id).weight__c) * fc.rate__c;
                                    qli.Unit_Freight_Cost__c = Decimal.valueOf(productMap.get(qli.product2Id).weight__c) * fc.rate__c;
                                    qli.Freight_Cost_Rate__c = getExchangeRates( fc.CurrencyIsoCode,OppCurrencyIsoCode);
                                }
                                else{
                                    //conversion to org currency
                                    if(productMap.get(qli.product2Id) != null && OppCurrencyIsoCode == orgCurrency && productMap.get(qli.product2Id).weight__c != null){
                                        qli.freight_cost__c = Decimal.valueOf(productMap.get(qli.product2Id).weight__c) * currencyUtil.convertToOrgCurrency(fc.rate__c, 
                                                                                                                                                            fc.currencyIsoCode, 
                                                                                                                                                            Date.today());
                                        qli.Unit_Freight_Cost__c = Decimal.valueOf(productMap.get(qli.product2Id).weight__c) * currencyUtil.convertToOrgCurrency(fc.rate__c, 
                                                                                                                                                            fc.currencyIsoCode, 
                                                                                                                                                            Date.today());
                                        qli.Freight_Cost_Rate__c = getExchangeRates( fc.CurrencyIsoCode,OppCurrencyIsoCode);
                                    }
                                    else if(productMap.get(qli.product2Id) != null && productMap.get(qli.product2Id).weight__c != null){
                                        qli.freight_cost__c = Decimal.valueOf(productMap.get(qli.product2Id).weight__c) * currencyUtil.convertToNonOrgCurrency(fc.rate__c, 
                                                                                                                                                               fc.currencyIsoCode, 
                                                                                                                                                               OppCurrencyIsoCode, 
                                                                                                                                                               Date.today());
                                        qli.Unit_Freight_Cost__c = Decimal.valueOf(productMap.get(qli.product2Id).weight__c) * currencyUtil.convertToNonOrgCurrency(fc.rate__c, 
                                                                                                                                                               fc.currencyIsoCode, 
                                                                                                                                                               OppCurrencyIsoCode, 
                                                                                                                                                               Date.today());
                                        qli.Freight_Cost_Rate__c = getExchangeRates( fc.CurrencyIsoCode,OppCurrencyIsoCode);
                                    }
                                    else{
                                        qli.Freight_Cost__c = 0.00;
                                        qli.Unit_Freight_Cost__c = 0.00;
                                        continue;
                                    }
                                }
                                break;
                            }
                            else{
                                qli.Freight_Cost__c = 0.00;
                                qli.Unit_Freight_Cost__c = 0.00;
                                continue;
                            }
                        }
                    }
                    else{
                        qli.Freight_Cost__c = 0.00;
                        qli.Unit_Freight_Cost__c = 0.00;
                        continue;
                    }
                }
            }
        }catch(Exception x){
            system.debug('error: ' + x.getMessage());
            system.debug('location: ' + x.getStackTraceString());
        }
        return updatedQuoteLines;
    }
    
    public static string getExchangeRates(String productCurrencyISOCode,String oppCurrencyISOCode){
		String productRateStr = currencyutil.getIsoRate(productCurrencyISOCode, Date.today());
        String oppRateStr = currencyutil.getIsoRate(oppCurrencyISOCode, Date.today());
		Decimal productRate = Decimal.valueOf(productRateStr);
        Decimal oppRate = Decimal.valueOf(oppRateStr);
        String s = '';
        s += productCurrencyISOCode + ' : '+ productRateStr+' , ';
        s += oppCurrencyISOCode + ' : '+ oppRateStr+' , ';
        s += oppCurrencyISOCode + '/' + productCurrencyISOCode + ' : '+String.valueOf((oppRate/productRate).setScale(2));
        return s;           
    }
        
}