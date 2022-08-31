/**
* @author: TQDev
* @Used for: test class for CSV_FileImportController components 
* @TestClass: CSV_FileImportControllerTest
* @History : 
*/ 
@isTest
public class CSV_FileImportControllerTest {
	@testSetup 
    public static void insertTestRecords(){
        TestService.createTestData();
        TestService.createWarehouse();
        //Create a test user
        //TestService.createTestUser(TestService.testUsername,TestService.testProfileName );
    }
    
    public static list<Object> getTestRows(string sObjectName){
        //field map
        list<CSV_FieldMappings__mdt> fieldMaps = CSV_FileImportController.getCSVfieldMappings(sObjectName);
        list<Product2> productList = [select id,Name from product2 limit 20];
        list<Object> rows = new list<Object>();
        for(Integer i = 1;i< 10; i++){
            map<String,Object> row = new map<String,Object>();
            for(CSV_FieldMappings__mdt fMap: fieldMaps){
                string header = fMap.CSV_Header__c;
                string dataType = fMap.CSV_DataType__c;
                if(dataType == 'Currency') row.put(header, (Double) i );
                if(dataType == 'String') row.put(header, i.format());
                if(dataType == 'Date') row.put(header,system.today().addDays(i) );
                if(dataType == 'DateTime') row.put(header,system.now().addDays(i) );
                if(dataType == 'Integer') row.put(header,i );
                if(dataType == 'Lookup') row.put(header,'test');
            }
            row.put('Salesforce_Product__c',productList[i].Name);
            rows.add(row);
        }
        return rows;
    }
    
    //Positive test
    public static testMethod void importRecordsTest(){
        
        //prepare  params
        string sObjectName = 'QuoteLineItem';
        
        //header
        list<String> headers = new list<string>(CSV_FileImportController.getFieldMapConfig(sObjectName).keyset());
        
        //quoteId
        string parentId = [select id from quote limit 1].Id;
        
        //csv data
        list<Object> rows = getTestRows(sObjectName);
        test.startTest(); 
        string result = CSV_FileImportController.importRecords(parentId, headers, rows);system.debug(result);
        CSV_ResponseMessage response = CSV_ResponseMessage.deserialize(result);
        //No Errors
        system.assert(response.success);
        Integer insertedRows = CSV_FileImportController.getExistingQuoteLineItemsCount(parentId);
        //All rows inserted
        system.assert(insertedRows == rows.size());
        
        //Posted to chatter
        CSV_FileImportController.postChatterFeedForFailedQuoteLineItems(0,1,parentId);
            
        //New CSV
        map<String,Object> row1 = new map<String,Object>();
        row1.put('Salesforce_Product__c','1');//dummy row
        map<String,Object> row2 = new map<String,Object>();
        row2.put('Salesforce_Product__c','zzz');//dummy product
        rows.add(row1);
        rows.add(row2);
        
        result = CSV_FileImportController.importRecords(parentId, headers, rows);
        response = CSV_ResponseMessage.deserialize(result);
        //No Errors
        system.assert(response.success);
        insertedRows = CSV_FileImportController.getExistingQuoteLineItemsCount(parentId);
        //No new rows inserted
        system.assert(insertedRows != rows.size());
        
        test.stopTest();
    }

    //Exceptions test
    public static testMethod void importRecordsExceptionsTest(){
        //prepare  params
        string sObjectName = 'QuoteLineItem';
        
        //header
        list<String> headers = new list<string>(CSV_FileImportController.getFieldMapConfig(sObjectName).keyset());
        
        //quoteId
        string parentId = [select id from quote limit 1].Id;
        
        //csv data
        list<Object> rows = getTestRows(sObjectName);
        
        test.startTest(); 
        headers[0] += 'test';//invalid column
        string result = CSV_FileImportController.importRecords(parentId, headers, rows);
        CSV_ResponseMessage response = CSV_ResponseMessage.deserialize(result);
        
        //Errors
        system.assert(!response.success);
        system.assert(response.message == 'Invalid columns');
        
        headers.remove(0); //Remove a column
        result = CSV_FileImportController.importRecords(parentId, headers, rows);
        response = CSV_ResponseMessage.deserialize(result);
        //Errors
        system.assert(!response.success);
        system.assert(response.message == 'Missing columns');
        
        result = CSV_FileImportController.importRecords(null, null, null);
        response = CSV_ResponseMessage.deserialize(result);
        //Errors
        system.assert(!response.success);
        test.stopTest();
    }
}