/**
* @author: Tquila dev
* @Description: Class that allows for cloning of objects not supported by Salesforce out of the box eg. Quotes
* @TestClass: CloneObject_Test
* @History : Created 24th June 2019
* 24th July - Add option to default a field on clone
*/ 
public class CloneObject {
    @AuraEnabled @InvocableVariable public String objectName; //object type to copy
    @AuraEnabled @InvocableVariable public String objectFromId; //object Id to clone from
    @AuraEnabled @InvocableVariable public List<String> objectDefaultFieldNames; //list of field names to default on clone
    @AuraEnabled @InvocableVariable public List<String> objectDefaultFieldValues; //list of field values to default on clone
    @AuraEnabled @InvocableVariable public String childObjectName; //child object type to copy
    @AuraEnabled @InvocableVariable public String childObjectParentFieldName; //child object type to copy
    @AuraEnabled @InvocableVariable public String childObjectParentToId; //Id of the parent object children should be assied to
    
    //invocable method to Clone an Object or Child Objects
    @InvocableMethod(label='Clone Object' description='Clones an Object OR an Object')
    public static List<String> createClone(List<CloneObject> cloneConfig) {
        List<String> clonedIds = new List<String>();
        //not designed to be executed in bulk
        CloneObject config = cloneConfig[0];
        
        //check if copying parent object
        if(String.isEmpty(config.childObjectName)) {
            clonedIds.add(cloneObject(config));
        } else { //copy children objects
            clonedIds.add(cloneChildren(config));
        }
        
        return clonedIds;
    }
    
    //clone an object based on passed object and id
    public static String cloneObject(CloneObject config) {
        System.Debug('Cloning Object: "' + config.objectName + '" Id: "' + config.objectFromId + '"');
        String objectSOQL = getObjectSOQL(config.objectName, 'Id=\'' + config.objectFromId + '\'', true);

        sObject currentObject = (sObject)Database.query(objectSOQL);
        //do not do a deep clone of related lookup fields
        sObject objectCopy = currentObject.clone(false,false);
        
        if(config.objectDefaultFieldNames != NULL && config.objectDefaultFieldNames != NULL) {
            //loop through all default variable list and assign to cloned object
            for(Integer i = 0; i < config.objectDefaultFieldNames.size(); i++) {
                String fieldName = config.objectDefaultFieldNames[i];
                String fieldValue = '';
                
                //ensure there is a matching field value passed
                if(i < config.objectDefaultFieldValues.size()) {fieldValue = config.objectDefaultFieldValues[i];}
                
                System.Debug('Default Field: "' + fieldName + '"" Value: "' + fieldValue + '"');
                objectCopy.put(fieldName, fieldValue);
            }
        }
        
        insert objectCopy;

        System.Debug('New Cloned Object Id: ' + objectCopy.Id);
        return objectCopy.Id;
    }
    
    //clone child objects of a passed object and id
    public static String cloneChildren(CloneObject config) {
        List<sObject> newChildObjects = new List<sObject>();
        
        String childObjectSOQL = getObjectSOQL(config.childObjectName, config.objectName + 'Id=\'' + config.objectFromId + '\'', true);

        List<sObject> currentChildrenList = (List<sObject>)Database.query(childObjectSOQL);
        
        for(sObject childItem : currentChildrenList) {
            sObject childItemCopy = childItem.clone(false,false);
            childItemCopy.put(config.childObjectParentFieldName, config.childObjectParentToId);
            newChildObjects.add(childItemCopy);
        }
        
        System.debug('Insert Children Count: ' + newChildObjects.Size());
        
        insert newChildObjects;

        return config.childObjectParentToId;
    }
    
    // Returns a dynamic SOQL statement for all creatable fields on the object
    public static string getObjectSOQL(String objectName, String whereClause, Boolean onlyUserCreatable) {
        String selects = '';
        
        if (!String.isEmpty(whereClause)) {
            whereClause = ' WHERE ' + whereClause;
        }
        
        // Get a map of field names and tokens
        Map<String, Schema.SObjectField> fieldsMap = Schema.getGlobalDescribe().get(objectName.toLowerCase()).getDescribe().Fields.getMap();
        list<string> selectFields = new list<string>();
        
        if (fieldsMap != null){
            //loop through all field tokens
            for (Schema.SObjectField fieldToken : fieldsMap.values()){
                Schema.DescribeFieldResult fieldDescribe = fieldToken.getDescribe();
                
                // field is creatable or we want all fields
                if (fieldDescribe.isCreateable() || !onlyUserCreatable){
                    selectFields.add(fieldDescribe.getName());
                }
            }
        }
        
        
        //build SOQL SELECT
        if (!selectFields.isEmpty()) {
            for (string s:selectFields) {
                selects += s + ',';
            }
            if (selects.endsWith(',')) {
                selects = selects.substring(0,selects.lastIndexOf(','));
            }
            
        }
        
        String SOQL = 'SELECT ' + selects + ' FROM ' + objectName + whereClause;
        return SOQL;
    }
}