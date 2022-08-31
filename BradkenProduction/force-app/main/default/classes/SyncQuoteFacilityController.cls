public with sharing class SyncQuoteFacilityController {
	@AuraEnabled
    public static List<Quote_Facility__c> getQuoteFacility(List<String> incomingIds) {
		return [
			SELECT Id, Name, Facility_Name__c, Lead_Time__c, Product_Cost__c, Bradken_Part_Number__c, ECL_Supplier_Grouping__c,Product_Cost_converted__c, CurrencyIsoCode, Converted_Product_Cost__c
			FROM Quote_Facility__c
			WHERE Id IN :incomingIds
		];
	}

	@InvocableMethod(label= 'Check if lineLtem have more then one facility.')
    public static List<Boolean> getQuoteFacilityFromFlow(List<String> ids) {
		List<String> incomingIds = ids.get(0).split(',');
		List<Quote_Facility__c> selectedQuoteFacilities =  [
			SELECT Id, Name, Facility_Name__c, Lead_Time__c, Quote_Line_Item__c
			FROM Quote_Facility__c
			WHERE Id IN :incomingIds
		];
		Set<Id> usedQuoteLineItems = new Set<Id>();
		for(Quote_Facility__c qf : selectedQuoteFacilities) {
			if(qf.Quote_Line_Item__c == null) {
				return new List<Boolean>{false};
			}
			usedQuoteLineItems.add(qf.Quote_Line_Item__c);
		}
		if(selectedQuoteFacilities.size() == usedQuoteLineItems.size()) {
			return new List<Boolean>{true};
		}
		return new List<Boolean>{false};
		
	}
}