/**
* @author: Tquila dev
* @Used for: utitlities for objects and fields   
* @description:  
* @TestClass: sObjectUtilTest
* @History : 
*/ 
public class sObjectUtil {
    
    public static list<Schema.DescribeFieldResult> getFieldDescribeList(string sObjectName){
		Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
        list<Schema.DescribeFieldResult> fieldDescribes = new list<Schema.DescribeFieldResult>();
        for(Schema.SObjectField fieldRef : fields.values()) {
            fieldDescribes.add(fieldRef.getDescribe());
        }
        return fieldDescribes;
    }
    
    public static string getAllFields(string sObjectName){
        return string.join(new list<String>(Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap().keyset()),',');
    }
    
	public static string getAllParentFields(string parentObjectName,string parentFieldApi){
        list<String> parentObjectFields = new list<String>();
        for(string s: Schema.getGlobalDescribe().get(parentObjectName).getDescribe().fields.getMap().keyset()){
           parentObjectFields.add(parentFieldApi+'.'+s);
        }
        return string.join(parentObjectFields,',');
    }
}