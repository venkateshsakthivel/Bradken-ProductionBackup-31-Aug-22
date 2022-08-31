/**
* @author: Tquila dev
* @Used for: controller for CSVImportQuoteLines components  
* @description: Save the loaded csv data
* @TestClass: CSV_FileImportControllerTest
* @History : 
*/ 
public with sharing class CSV_FileImportController {

    private static CSV_ResponseMessage response;
    
    public static string sObjectName = 'QuoteLineItem';
    @auraEnabled
    public static String importRecords(string parentId, list<String> headers, list<Object> rows) {
        SavePoint beforeImport ; 
        try{
            
            //Get Quoteline's editable fields
            set<String> quoteLineFields = getEditableFields(sObjectName);
            
            //Get Quote Details
            Quote quote = getQuoteDetails(parentId);
            
            //check for required columns
            map<String,String> fieldMap = getFieldMapConfig(sObjectName);
            if(headers.size() < fieldMap.size()){
                response = new CSV_ResponseMessage(System.Label.CSV_Apex_Error_Missing_Columns,false);
                return JSON.serialize(response);
            }
            
            // check if headers are valid
            boolean isValid = isValidHeaders(headers,fieldMap);
            if(!isValid){
                response = new CSV_ResponseMessage(System.Label.CSV_Apex_Error_Invalid_Columns,false);
                return JSON.serialize(response);
            }
            
            //Get product codes
			set<String> productCodes = new set<String>();
            for(Object row : rows){
                productCodes.add(parseStringField(row,'Salesforce_Product__c'));
            }
            
            //Get pricebook Entries
            map<String,priceBookEntry> priceBookEntryMap = getProductCodeMap(productCodes,quote.Pricebook2Id,quote.CurrencyIsoCode);
            
            //Get Data Type Map
            map<String,String> dataTypeMap = getCSVDataType(sObjectName);
            
            //Create QLI to insert
            list<QuoteLineItem> quoteLineItems = new list<QuoteLineItem>();
            map<Integer,String> failRows = new map<Integer,String>();
            map<Integer,String> successRows = new map<Integer,String>();
            map<Integer,Integer> insertRowsIndex = new map<Integer,Integer>();
            Integer insertIndex = 0;
            for(Integer rowCount = 0; rowCount < rows.size();  rowCount++){
                Object row = rows[rowCount];
            	string productCode = parseStringField(row,'Salesforce_Product__c');
                pricebookEntry pbe = priceBookEntryMap.get(productCode);
                QuoteLineItem qli;
                try{
                    qli = mapQuoteLineFields(row,quoteLineFields,dataTypeMap);
                    system.debug('qli: '+qli);
                }catch(Exception e){
                    failRows.put(rowCount,e.getMessage());
                }
                if(qli != null){
                    if(pbe != null){
                        qli.Imported__c = true;
                    	qli.QuoteId = parentId;
                        qli.PricebookEntryId = pbe.Id;
                        qli.Product2Id = pbe.Product2Id;
                        if(qli.UnitPrice == null)
                            qli.UnitPrice = pbe.UnitPrice;
                        quoteLineItems.add(qli);
                        insertRowsIndex.put(insertIndex,rowCount);
                        insertIndex++;
                    }else{
                        failRows.put(rowCount,'\''+productCode+'\''+System.Label.CSV_Apex_Error_ProductNotFoundOnPricebook +'\''+quote.Pricebook2Id+'\'\n');
                    }
                }
            }
            beforeImport = database.setSavepoint();
            List<QuoteLineItem> existingQuoteLineItems = [Select Id FROM QuoteLineItem Where QuoteId =: parentId];
            if(!existingQuoteLineItems.isEmpty())
                delete existingQuoteLineItems;
            //Handle Partial save
            list<Database.SaveResult> saveResults = Database.insert(quoteLineItems, false);
            for (Integer rowCount = 0; rowCount < saveResults.size();  rowCount++){
                Database.SaveResult sr = saveResults.get(rowCount);
                Integer rowIndex = insertRowsIndex.get(rowCount);
                if (sr.isSuccess()) successRows.put(rowIndex,sr.getId()); 
                else failRows.put(rowIndex,getErrorMessages(sr));
            }
            if(!failRows.isEmpty()) database.rollback(beforeImport);
            //return results
			response = new CSV_ResponseMessage(JSON.serialize((new list<Object>{successRows,failRows})),true);
        }catch(Exception e){
            if(beforeImport != null) database.rollback(beforeImport);
            response = new CSV_ResponseMessage('Internal Error \n'+e.getStackTraceString()+'\n'+e.getMessage(),false);
        }
        return JSON.serialize(response);
    }
    
    //parse error messages
    private static string getErrorMessages(Database.SaveResult sr){
        String errorMessage = '';
        for(Database.Error err : sr.getErrors()) {
            errorMessage += err.getStatusCode() + ': ' + err.getMessage() + '['+ err.getFields() +']\n' ;
        }
        return errorMessage;
    }
    
    //Check if Headers are valid
    private static boolean isValidHeaders(list<String> headers,map<String,String> fieldMap){
        boolean isValid = true;
        for(String header :headers){
            if(!fieldMap.containsKey(header)){
                isValid = false;break;
            }
        }
        return isValid;
    }
    
    //Map Quote line item fields
    private static QuoteLineItem mapQuoteLineFields(object row,set<String> quoteLineFields,map<String,String> dataTypeMap){
        QuoteLineItem qli = new QuoteLineItem(); 
        Map<String, Object> rowObj = (Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(row));
        for(String fieldAPI : quoteLineFields){
            if(rowObj.get(fieldAPI) != null ){
                string dataType = dataTypeMap.get(fieldAPI);
                if(dataType == 'Currency'){
            		qli.put(fieldAPI, (Double) rowObj.get(fieldAPI));
                }
                if(dataType == 'String'){
            		qli.put(fieldAPI, (String.valueOf(rowObj.get(fieldAPI))));
                }
                if(dataType == 'Date'){
            		qli.put(fieldAPI, (Date) rowObj.get(fieldAPI));
                }
                if(dataType == 'DateTime'){
            		qli.put(fieldAPI, (DateTime) rowObj.get(fieldAPI));
                }
                if(dataType == 'Integer'){
            		qli.put(fieldAPI, (Integer) rowObj.get(fieldAPI));
                }
                if(dataType == 'Lookup'){//BUC-11
                    Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap().get(fieldAPI).getDescribe();
					SObject lookupObject = (SObject)(Type.forName('Schema.'+ fieldResult.referenceto[0]).newInstance());
                    //if a similar request is made and exteranlId is different, 
                    //then create a field on metadata and get the mappped value OR do a if-else
                    lookupObject.put('Unibis_External_ID__c',String.valueOf(rowObj.get(fieldAPI)));
                    qli.putSObject(fieldResult.relationshipName , lookupObject);
                }   
            }
        }
        return qli; 
    }
    
    //parse fields
    public static string parseStringField(object row, string fieldAPI){
        return String.valueOf(((Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(row))).get(fieldAPI));
    }
    
    //Query for product codes and pricebookentries from quote's pricebook
    private static map<string,PricebookEntry> getProductCodeMap(set<String> productCodes,String pricebookId, String CurrencyIsoCode){
        map<string,PricebookEntry> productCodemap = new map<string,PricebookEntry>();
        for(PricebookEntry pbe : [SELECT Pricebook2Id, Product2Id, UnitPrice, IsActive, ProductCode, Name, Id 
                                  FROM PricebookEntry 
                                  where Name in:productCodes
                                  and Pricebook2Id =: pricebookId
                                  and CurrencyIsoCode =: CurrencyIsoCode
                                  and isActive = true
                                 ]){
            productCodemap.put(pbe.Name,pbe);
        }
		return productCodemap;
    }
    
    //Get Header mapping
    @auraEnabled
    public static map<String,String> getFieldMapConfig(String sObjectName){
        map<String,String> fieldMap = new map<String,String>();
        for(CSV_FieldMappings__mdt fieldMapping : getCSVfieldMappings(sObjectName)){
              fieldMap.put(fieldMapping.CSV_Header__c,fieldMapping.CSV_SalesforceFieldAPI__c);
        }  
     	return fieldMap;
    }
    
    @auraEnabled
    public static Integer getExistingQuoteLineItemsCount(String ParentId){
        return [SELECT count() FROM QuoteLineItem Where QuoteId =: ParentId];
    }
    
    //Get Data Mapping
    public static map<String,String> getCSVDataType(String sObjectName){
        map<String,String> fieldMap = new map<String,String>();
        for(CSV_FieldMappings__mdt fieldMapping : getCSVfieldMappings(sObjectName)){
              fieldMap.put(fieldMapping.CSV_SalesforceFieldAPI__c,fieldMapping.CSV_DataType__c);
        }
     	return fieldMap;
    }
    
    //Get Field Mapping
    public static list<CSV_FieldMappings__mdt> getCSVfieldMappings(String sObjectName){
        list<CSV_FieldMappings__mdt> fieldMappings = [SELECT Id, DeveloperName, MasterLabel, NamespacePrefix, Label, QualifiedApiName, 
                                                             CSV_Header__c ,CSV_ObjectName__c, CSV_SalesforceFieldAPI__c , CSV_DataType__c  
                                                      FROM CSV_FieldMappings__mdt  
                                                      WHERE CSV_ObjectName__r.CSV_sObjectName__c  =:sObjectName
                                                     ];
        return fieldMappings;
    }
    
    //Get Editable Fields
    public static set<String> getEditableFields(String sObjectName){
        Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
        set<String> editableFields = new set<String>();
        for(Schema.SObjectField fieldRef : fields.values()) {
            Schema.DescribeFieldResult fieldResult = fieldRef.getDescribe();
            if(fieldResult.isUpdateable()) {
                editableFields.add(fieldResult.getname());
            }
        }
        return editableFields;
    }
    
    //get Quote Record Details
    public static Quote getQuoteDetails(String parentId){
        return [select id,Name,pricebook2Id, CurrencyIsoCode from quote where id=:parentId limit 1];
    }
    
    @auraEnabled
    public static void postChatterFeedForFailedQuoteLineItems(Integer failedRecordsCount, Integer totalRecords, Id parentId){
        FeedItem post = new FeedItem();
        post.ParentId = parentId;
        post.Body = failedRecordsCount+' '+System.Label.CSV_Apex_Error_Post_message+' '+totalRecords;
        insert post;
    }
}