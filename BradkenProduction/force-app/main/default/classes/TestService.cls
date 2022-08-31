/*
 * Contains test methods 
 * Add the test records to be created here
 */ 
@isTest
public class TestService {
	
    public static string testPriceBookName = 'testpricebook';
    public static string testUsername = 'test@test.com';
    public static string testProfileName = 'System Administrator';
    //User defaults
    public static  string defaultTimeZoneSidKey = 'Australia/Sydney';
    public static  string defaultLocaleSidKey = 'en_AU';
    public static  string defaultEmailEncodingKey = 'ISO-8859-1'; 
    public static  string defaultLanguageLocaleKey = 'en_US';
    public static  string defaultCurrencyISOcode = 'AUD';
	
    public static void createTestData(){
        Account a = createTestAccount('TestAccount');
        Contact c = createTestContact('firstname','lastName',testUsername,a.Id);
        Pricebook2 pb = createPricebook();
        testProductSetup(pb);
        Opportunity opp = createTestOpportunity('testOpportunity','New',system.today().addDays(1),a.Id,pb.Id);
        createTestQuote('TestQuote',opp.Id, pb.Id,c.Id, system.today().addDays(1));
    }
    
    public static Account createTestAccount(String accountName){
        Account a = new Account();
        a.name = accountName;
        insert a;
        return a;
    }
    
	public static Contact createTestContact(String firstName,String lastName,String email,Id accountId){
        Contact c = new Contact();
        c.FirstName = firstName;
        c.LastName = lastName;
        c.Email = email;
        c.AccountId = accountId;
        insert c;
        return c;
    }
    
    public static Opportunity createTestOpportunity(String oppName,String stageName,date closeDate,Id accountId,Id priceBookId){
        Opportunity opp = new Opportunity();
        opp.Name = oppName;
        opp.StageName = stageName;
        opp.CloseDate =  closeDate;
        opp.AccountId = accountId;
        opp.Pricebook2Id = priceBookId;
        insert opp;
        return opp;
    }
    
    public static Quote createTestQuote(string quoteName,Id opportunityId, Id pricebookId,Id contactId,date expDate){
        Quote q = new Quote();
        q.Name= quoteName;
        q.OpportunityId=opportunityId;
        q.Pricebook2Id = pricebookId; 
        q.ContactId=contactId;
        q.ExpirationDate=expDate;
        //:16-MAY-22:Below fileds added by FullCRM as part of Product Inactive QLE change
        q.Named_Place__c = 'Bradken Jet park'; 
        q.Inco_Term__c = 'CFR';
        q.T_C_s_applied__c = 'Bradken Australia';
        q.NewCustomer__c = 'Yes';
        q.UnapprovedNonStdPaymentTerms__c = 'Yes';
        q.UnapprovedNonStandardTCs__c = 'Yes';
        
        
            
            
        insert q;
        return q;
    }
    
    public static list<Product2> getProductsList(){
        list<Product2> productList = new list<Product2>();
        for(Integer i= 0; i< 10; i++){
            Product2 product = new Product2();
            product.Name = i.format();
            product.IsActive = true;
            productList.add(product);
        }
        return productList;
    }
    
    public static void createPricebookEntries(list<Product2> productList,String pricebookId,String currencyCode){
        list<PricebookEntry> pricebookEntryList = new list<PricebookEntry>(); 
        Integer cost = 10;
        for(Product2 product:productList){
            PricebookEntry pbe = new PricebookEntry();
            pbe.Pricebook2Id = pricebookId;
            pbe.Product2Id = product.Id;
            pbe.UnitPrice = cost++;
            pbe.CurrencyIsoCode = currencyCode;
            pbe.IsActive = true;
            pricebookEntryList.add(pbe);
        }
        insert pricebookEntryList;
    }
    
    public static pricebook2 createPricebook(){
        //Insert pricebook
        Pricebook2 pb = new Pricebook2();
        pb.Name = testPriceBookName;
        pb.currencyISOCode = defaultCurrencyISOcode;
        pb.IsActive =true;
        insert pb;
        return pb;
    }
    
    public static void testProductSetup(Pricebook2 pb){
        //Insert products
        list<Product2> productList = new list<Product2>();
        productList.addAll(getProductsList());
        insert productList;
		
        //Insert PricebookEntries
        createPricebookEntries(productList,Test.getStandardPricebookId(),defaultCurrencyISOcode);
        createPricebookEntries(productList,pb.Id,defaultCurrencyISOcode);
    }
    
    public static User createTestUser(string username,string profileName){
    	User user = new User();         
        user.firstName = username;
        user.lastName = username;
        user.Username = username;
        user.Email = username;
        user.Alias = username.substring(0,2)+ username.substring(0,2);
        user.TimeZoneSidKey = defaultTimeZoneSidKey;
        user.LocaleSidKey = defaultLocaleSidKey;
        user.EmailEncodingKey = defaultEmailEncodingKey;
        user.LanguageLocaleKey = defaultLanguageLocaleKey;
        user.CurrencyIsoCode = defaultCurrencyISOcode;
        user.ProfileId = [SELECT Id 
                          From Profile 
                          WHERE Name =: profileName
                          Limit 1].Id;
        
        insert user;
        return user;
    }
    
    public static User getTestUser(string username){
    	return [select id,firstName,LastName,username,Email, ProfileId from User where username =:username and isActive = true limit 1];   
    }
    
    public static list<OpportunityLineItem> createOpportunityLineItem(Opportunity opp){
        list<OpportunityLineItem> oppLines = new list<OpportunityLineItem>();
        for(PricebookEntry pbe : [select id ,unitPrice from PricebookEntry where Pricebook2Id=:opp.Pricebook2Id]){
            OpportunityLineItem oppline = new OpportunityLineItem();
            oppline.OpportunityId = opp.Id;
            oppline.UnitPrice = pbe.UnitPrice;
            oppline.PricebookEntryId = pbe.Id;
            oppline.Quantity = 10;
            oppLines.add(oppline);
        }
        insert oppLines;
        return oppLines;
    }
    
    public static Warehouse__c createWarehouse(){
        Warehouse__c warehouse = new Warehouse__c();
        warehouse.Fkey__c = 'test';
        warehouse.Unibis_External_ID__c = 'test';
        warehouse.Name = 'test';
        insert warehouse;
        return warehouse;
    }
}