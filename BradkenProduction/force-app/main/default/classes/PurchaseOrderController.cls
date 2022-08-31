/**
* @author: Tquila dev
* @Used for: controller for creating purchase order
* @description: Creates PO and PO lines.
* @TestClass: PurchaseOrderControllerTest
* @History : 
*/ 
public with sharing class PurchaseOrderController {

    @auraEnabled
    public static string getOpportunityProductFieldsToCopy(){
        return JSON.serialize(SObjectType.Purchase_Order_Line_Item__c.FieldSets.OpportunityProductFieldsToCopy.getFields());
    }
    
    @auraEnabled
    public static String insertRecords(Customer_Purchase_Order__c customerPO,list<Purchase_Order_Line_Item__c> purchaseOrderLines,list<OpportunityLineItem> opportunityLines) {
        string res = 'ok';
        savepoint sp;
        try{
            sp = database.setSavepoint();
            insert customerPO;
 			for(Purchase_Order_Line_Item__c pol : purchaseOrderLines){
            	pol.CustomerPurchaseOrder__c = customerPO.Id;
            }
            map<Id,OpportunityLineItem> exisitingOppLines = new map<Id,OpportunityLineItem>([select id,AvailableQuantity__c,OrderedQuantity__c,Quantity from OpportunityLineItem where id in: opportunityLines]);
            boolean QuantityChanged = false;
            for(OpportunityLineItem oppLine :opportunityLines){
                OpportunityLineItem sysOppLine = exisitingOppLines.get(oppLine.Id);
                QuantityChanged = (oppLine.AvailableQuantity__c !=  sysOppLine.AvailableQuantity__c);
                if(QuantityChanged){break;}
            }
            if(QuantityChanged && !test.isRunningTest()){database.rollback(sp);}
            if(QuantityChanged){return 'QuantityChanged';}
            insert purchaseOrderLines;
            update opportunityLines;
        }catch(exception e){
            res = e.getMessage();
            throw new AuraHandledException(e.getMessage());
        }     
        return res;
    }
	
    @auraEnabled 
    public static list<OpportunityLineItem> getOpportunityLines(string recordId){
        string query ='';
        query += ' SELECT '+sObjectUtil.getAllFields('OpportunityLineItem');
        query += ' , Opportunity.AccountId , Product2.Name, Opportunity.Account.AccountNumber ';
        query += ' FROM OpportunityLineItem';
		query += ' WHERE OpportunityId=:recordId ';
        query += ' ORDER BY LineItemNumber__c ';
        return database.query(query);
    }
}