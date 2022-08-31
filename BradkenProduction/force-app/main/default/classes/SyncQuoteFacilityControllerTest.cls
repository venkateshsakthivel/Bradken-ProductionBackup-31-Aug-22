@IsTest
public with sharing class SyncQuoteFacilityControllerTest {
	static final Integer numberRecords = 10;
	static List<String> ids;

	static{
		Account testAcc = new Account(Name = 'testAcc');
		insert testAcc;
		Product2 testProduct = new Product2(Name = 'testProduct', isActive = true);
		insert testProduct;
		Pricebook2 pb = new Pricebook2(Name = 'testPriceBook', IsActive = true );
        insert pb;
		PriceBookEntry testPBE = new PriceBookEntry(UnitPrice = 300, PriceBook2Id = Test.getStandardPricebookId(),
                                                        Product2Id = testProduct.Id, IsActive = true);
        insert testPBE;
		Opportunity testOpp = new Opportunity(Name = 'testOpp', AccountId = testAcc.Id, StageName = 'New', CloseDate = Date.today()+1);
        insert testOpp;
		Quote testQuote = new Quote(OpportunityId = testOpp.Id, Name = 'testQuote', Pricebook2Id = Test.getStandardPricebookId(), Status = 'New', Named_Place__c='Test' ,Inco_Term__c ='CFR');
        insert testQuote;
		List<Manufacturing_Facility__c> testListManufacturingFacilites = new List<Manufacturing_Facility__c>();
		for(Integer i = 0; i < numberRecords; i++) {
			testListManufacturingFacilites.add(new Manufacturing_Facility__c(
				Name = 'testMF' + i
			));
		}
		insert testListManufacturingFacilites;

		OpportunityLineItem oli = new OpportunityLineItem(OpportunityId = testOpp.id, Quantity = 1, PricebookEntryId = testPBE.Id, totalPrice = 200);
       insert oli;

		QuoteLineItem qli = new QuoteLineItem(QuoteId = testQuote.Id, PriceBookentryId = testPBE.Id, Quantity = 1, UnitPrice = 1, Product2Id = testProduct.Id);
    	insert qli; 


		List<Quote_Facility__c> testListQuoteFacilites = new List<Quote_Facility__c>();
		for(Integer i = 0; i < numberRecords; i++) {
			testListQuoteFacilites.add(new Quote_Facility__c(
				Quote__c = testQuote.Id,
				Facility__c = testListManufacturingFacilites.get(i).Id,
				Quote_Line_Item__c = qli.Id
			));
		}
		insert testListQuoteFacilites;
		List<String> quoteIds = new List<String>();
		for(Quote_Facility__c q : testListQuoteFacilites) {
			quoteIds.add(q.Id);
		}
		ids = quoteIds;
	}

	@isTest
	public static void testGetQuoteFacility() {
		Test.startTest();
		List<Quote_Facility__c> result = SyncQuoteFacilityController.getQuoteFacility(ids);
		Test.stopTest();
		System.assert(result != null);
	}

	@isTest
	public static void testGetQuoteFacilityFromFlow() {
		Test.startTest();
		List<Boolean> result = SyncQuoteFacilityController.getQuoteFacilityFromFlow(ids);
		Test.stopTest();
		System.assert(result != null);
	}
}