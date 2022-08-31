/**
* @author: Tquila dev
* @Used for: test class for QuoteLineEditorController components 
* @TestClass: QuoteLineEditorControllerTest
* @History : 
*/ 
@isTest
public class QuoteLineEditorControllerTest {
	@testSetup
    public static void insertTestRecords(){
        TestService.createTestData();
        //Create a test user
        //TestService.createTestUser(TestService.testUsername,TestService.testProfileName );
        
    }
    
    public static testmethod void quoteLineEditorTest(){
		Quote testQuote = [select id,AccountId from quote limit 1];
        Customer_Pricebook__c customerPb = new Customer_Pricebook__c();
        customerPb.Account__c = testQuote.AccountId;
        customerPb.Price_Book__c = [select id from pricebook2 where name=:TestService.testPriceBookName limit 1].Id;
		insert  customerPb;
        
        Customer_Product__c customerProduct = new Customer_Product__c();
        customerProduct.Customer_Product_Description__c = '1test';
        customerProduct.Product__c = [select id from Product2 where name='1' limit 1].Id;
        customerProduct.Account__c = customerPb.Account__c;
        insert customerProduct;
        test.startTest();
        
        list<QuoteLineEditor__mdt> configs = QuoteLineEditorController.getQuoteLineEditorConfig();
		system.assert(!configs.isEmpty());
		
        String qliFd = QuoteLineEditorController.getQuoteLineFieldDescribe();
        system.assert(!string.isBlank(qliFd));
        
        Quote q = QuoteLineEditorController.getQuoteDetails(testQuote.Id);
        system.assert(q.Id == testQuote.Id);
        
        list<Pricebook2> pricebooks1 = QuoteLineEditorController.getPricebooks('');
        system.assert(pricebooks1.get(0).Id == test.getStandardPricebookId());
        
        list<Pricebook2> pricebooks = QuoteLineEditorController.getPricebooks(q.AccountId);
        system.assert(!pricebooks.isEmpty());
        
        list<PricebookEntry> pbEntries = QuoteLineEditorController.getProducts('1',pricebooks.get(0).Id,q.currencyIsoCode);
        system.assert(!pbEntries.isEmpty());

        String searchResultStr = QuoteLineEditorController.searchProducts('1', pricebooks.get(0).Id,q.AccountId,q.currencyIsoCode);
        map<String,Object> searchResultMap = (map<String,Object>)JSON.deserializeUntyped(searchResultStr);
        system.assert(!searchResultMap.isEmpty());
        
        String orderItemsStr = QuoteLineEditorController.getOrderItems(new list<String>{pbEntries.get(0).Product2Id},q.AccountId);
            
        QuoteLineEditorController.saveQuoteLines(new list<QuoteLineItem>(),new list<String>());
        
        //add product
		QuoteLineItem qli1= new QuoteLineItem();
        qli1.quoteId = q.Id;
        qli1.Quantity = 1;
        qli1.PricebookEntryId = pbEntries.get(0).Id;
        qli1.UnitPrice = 100;

        QuoteLineItem qli2= new QuoteLineItem();
        qli2.quoteId = q.Id;
        qli2.Quantity = 1;
        qli2.PricebookEntryId = pbEntries.get(0).Id;
        qli2.UnitPrice = 100;

        QuoteLineEditorController.saveQuoteLines(new list<QuoteLineItem>{qli1,qli2},new list<String>());
		
        list<QuoteLineItem> qlis =  QuoteLineEditorController.getQuoteLineItems(testQuote.Id);
        system.assert(!qlis.isEmpty());

        //remove product
        QuoteLineEditorController.saveQuoteLines(new list<QuoteLineItem>(),new list<String>{qlis.get(0).Id});
		qlis =  QuoteLineEditorController.getQuoteLineItems(testQuote.Id);
        system.assert(qlis.size() == 1);
        
        //Change Pricebook
        QuoteLineEditorController.updateQuotePricebook(testQuote);
		qlis =  QuoteLineEditorController.getQuoteLineItems(testQuote.Id);
        system.assert(qlis.isEmpty());
        
        QuoteLineEditorController.saveQuoteLines(qlis,new list<String>{'123'});
		QuoteLineEditorController.updateQuotePricebook(new Quote());

        test.stopTest();
    }
    @isTest static void testFreightAndProductCostCalc(){
        Quote testQuote = [select id,AccountId from quote limit 1];
        Customer_Pricebook__c customerPb = new Customer_Pricebook__c();
        customerPb.Account__c = testQuote.AccountId;
        customerPb.Price_Book__c = [select id from pricebook2 where name=:TestService.testPriceBookName limit 1].Id;
		insert  customerPb;
        
        Product2 customerProduct = new Product2();
        customerProduct.Name = 'testProd';
        insert customerProduct;

        CurrencyType ct = [SELECT IsoCode FROM CurrencyType WHERE IsCorporate = true];

        Warehouse__c wh = new Warehouse__c();
        wh.Name = 'test warehouse';
        wh.currencyIsoCode = ct.IsoCode;
        insert wh;

        Unibis_Freight_Cost__c ufc = new Unibis_Freight_Cost__c();
        ufc.despatchWH__c = wh.Id;
        ufc.Supply_Warehouse__c = 'A12';
        ufc.Rate__c = 10.00;
        ufc.currencyIsoCode = ct.IsoCode;
        insert ufc;

        Unibis_Product_Cost__c upc = new Unibis_Product_Cost__c();
        upc.Part_Number__c = customerProduct.Id;
        upc.Cost__c = 10.00;
        upc.Supply_Warehouse__c = 'A12';
        upc.currencyIsoCode = ct.IsoCode;
        insert upc;

        test.startTest();

        List<quoteLineItem> quoteLineItemsToUpdate = new List<quoteLineItem>();

        QuoteLineItem qli1= new QuoteLineItem();
        qli1.quoteId = testQuote.Id;
        qli1.Quantity = 1;
        //qli1.PricebookEntryId = pbEntries.get(0).Id;
        qli1.UnitPrice = 100;
        qli1.Supplier__c = 'A12';
        qli1.Despatch_Warehouse__c = wh.Id;
        qli1.Bradken_Part_Number__c = customerProduct.Name;
        quoteLineItemsToUpdate.add(qli1);
        
        List<QuoteLineItem> quoteLinesCalculated = QuoteLineEditorController.calculateProductAndFreightCosts(quoteLineItemsToUpdate);
        system.debug('quoteLineItems' + quoteLinesCalculated);

        test.stopTest();
    }
}