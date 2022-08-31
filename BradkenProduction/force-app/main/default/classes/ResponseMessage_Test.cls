@isTest
public class ResponseMessage_Test {

    public static testmethod void insertTestRecords(){
        ResponseMessage res = new ResponseMessage('test',true);
        ResponseMessage.deserialize('{"success":true,"message":"test"}');
    }
}