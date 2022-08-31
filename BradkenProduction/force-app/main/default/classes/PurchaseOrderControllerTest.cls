/**
* @author: Tquila dev
* @Used for: test class for PurchaseOrderController components 
* @TestClass: PurchaseOrderControllerTest
* @History : 
*/ 
@isTest
public class PurchaseOrderControllerTest {
	@testSetup
    public static void insertTestRecords(){
        TestService.createTestData();
        TestService.createOpportunityLineItem([select id,Pricebook2Id from opportunity limit 1]);
        //Create a test user
        //TestService.createTestUser(TestService.testUsername,TestService.testProfileName );
        
    }
    
    public static testmethod void getOpportunityLinesTest(){
        string recordId = [select id,Pricebook2Id from opportunity limit 1].id;
        test.startTest();
            list<OpportunityLineItem> olis = PurchaseOrderController.getOpportunityLines(recordId);
            system.assert(!olis.isEmpty());
		test.stopTest();
    }
    
    public static testmethod void insertRecordsTest(){
        
        boolean isSuccess = true;
        try{
            test.startTest();
            Customer_Purchase_Order__c cpo = new Customer_Purchase_Order__c();
            cpo.Account__c = [select id from Account limit 1].Id;
            cpo.Opportunity__c = [select id from Opportunity limit 1].Id;
            cpo.Name = '123';
            list<Purchase_Order_Line_Item__c> purchaseOrderLines = new list<Purchase_Order_Line_Item__c>();
            list<OpportunityLineItem> olis = PurchaseOrderController.getOpportunityLines(cpo.Opportunity__c);
            
            for(OpportunityLineItem oli : olis){
                Purchase_Order_Line_Item__c pol = new Purchase_Order_Line_Item__c();
                pol.Quantity__c = 1;
                purchaseOrderLines.add(pol);
            }
            String res = PurchaseOrderController.insertRecords(cpo,purchaseOrderLines,olis);
            system.assert(res == 'ok');
            string s = PurchaseOrderController.getOpportunityProductFieldsToCopy();
            test.stopTest();
            res = PurchaseOrderController.insertRecords(null,null,null);
        }catch(Exception e){
            isSuccess = false;
        }
		system.assert(!isSuccess);
		
    }

}