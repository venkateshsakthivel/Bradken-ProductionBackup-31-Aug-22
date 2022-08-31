/**
* @author: Tquila dev
* @Description: Test class for CloneObject
* @History : Created 24th June 2019
*/ 
@isTest
public class CloneObject_Test {
    public static Account testAccount;
    public static List<Contact> testContactsList;
    
    static void setup() {
        //Setup
        //Insert Account
        testAccount = new Account();
        testAccount.Name = 'Test Account';
        
        insert testAccount;
        
        //Insert Contacts
        testContactsList = new List<Contact>();
        
        for(Integer i = 0; i <= 10; i++) {
            Contact testContact = new Contact();
            
            testContact.Lastname = 'Test Last ' + i;
            testContact.AccountId = testAccount.id;
            
            testContactsList.add(testContact);
        }

        insert testContactsList;
    }
    
    //Test if cloning of parent object works
    @isTest static void objectCloned() {
        //setup test data
        setup();
        
        CloneObject cloneParameters = new CloneObject();
        cloneParameters.objectName = 'Account';
        cloneParameters.objectFromId = testAccount.Id;
        
        List<CloneObject> configParamList = new List<CloneObject>();
        configParamList.add(cloneParameters);
        
        //Execute
        Test.startTest();
        List<String> clonedObjects = CloneObject.createClone(configParamList);
        Test.stopTest();
        
        //Assert
        System.assertEquals(clonedObjects.Size(), 1, 'Did not return correct number of cloned Objects');
        
        List<Account> allAccounts = [SELECT Id FROM Account];
        System.assertEquals(2, allAccounts.Size(), 'Wrong number of rows cloned');
        
        Account clonedAccount = [SELECT Id, Name FROM Account WHERE Id =: clonedObjects[0]];
        System.assert(clonedAccount != NULL, 'No account cloned');
        System.assertEquals(testAccount.Name, clonedAccount.Name, 'Wrong Name cloned');
    }
    
    //Test if cloning of parent object works with defaulted fields
    @isTest static void objectClonedWithDefaults() {
        //setup test data
        setup();
        
        String defaultTestAccountNumber = '111';
        
        CloneObject cloneParameters = new CloneObject();
        cloneParameters.objectName = 'Account';
        cloneParameters.objectFromId = testAccount.Id;
        
        List<String> defaultFields = new List<String>();
        defaultFields.add('AccountNumber');
        cloneParameters.objectDefaultFieldNames = defaultFields;
        
        List<String> defaultValues = new List<String>();
        defaultValues.add(defaultTestAccountNumber);
        cloneParameters.objectDefaultFieldValues = defaultValues;
        
        List<CloneObject> configParamList = new List<CloneObject>();
        configParamList.add(cloneParameters);
        
        //Execute
        Test.startTest();
        List<String> clonedObjects = CloneObject.createClone(configParamList);
        Test.stopTest();
        
        //Assert
        System.assertEquals(clonedObjects.Size(), 1, 'Did not return correct number of cloned Objects');
        
        List<Account> allAccounts = [SELECT Id FROM Account];
        System.assertEquals(2, allAccounts.Size(), 'Wrong number of rows cloned');
        
        Account clonedAccount = [SELECT Id, Name, AccountNumber FROM Account WHERE Id =: clonedObjects[0]];
        System.assert(clonedAccount != NULL, 'No account cloned');
        System.assertEquals(testAccount.Name, clonedAccount.Name, 'Wrong Name cloned');
        System.assertEquals(defaultTestAccountNumber, clonedAccount.AccountNumber, 'Defaulted field not assigned in Clone');
    }
    
    //test if cloning of children (related) objects work
    @isTest static void objectChildrenCloned() {
        //Setup test data
        setup();

        Account copyToAccount = new Account();
        copyToAccount.Name = 'Copy To Account';
        
        insert copyToAccount;
        
        CloneObject cloneParameters = new CloneObject();
        cloneParameters.objectName = 'Account';
        cloneParameters.objectFromId = testAccount.Id;
        cloneParameters.childObjectName = 'Contact';
        cloneParameters.childObjectParentFieldName = 'AccountId';
        cloneParameters.childObjectParentToId = copyToAccount.Id;
        
        List<CloneObject> configParamList = new List<CloneObject>();
        configParamList.add(cloneParameters);
        
        //Execute
        Test.startTest();
        List<String> clonedParentObjects = CloneObject.createClone(configParamList);
        Test.stopTest();
        
        //Assert
        System.assertEquals(clonedParentObjects.Size(), 1, 'Did not return correct number of cloned Objects');
        
        List<Contact> allContacts = [SELECT Id FROM Contact];
        System.assertEquals(testContactsList.Size() * 2, allContacts.Size(), 'Wrong number of child rows cloned');
        
        List<Contact> clonedContacts = [SELECT Id, Lastname FROM Contact WHERE AccountId =: clonedParentObjects[0]];
        System.assert(clonedContacts != NULL, 'No contacts cloned');
        System.assertEquals(testContactsList.Size(), clonedContacts.Size(), 'Wrong number of child rows added to parent');
        System.assertEquals(testContactsList[0].Lastname, clonedContacts[0].Lastname, 'Wrong Name cloned');
    }
}