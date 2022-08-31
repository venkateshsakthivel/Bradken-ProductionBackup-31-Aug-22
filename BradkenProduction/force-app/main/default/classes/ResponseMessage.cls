public without sharing class ResponseMessage{
    public Boolean success;
    public string message;
   
    public ResponseMessage(String message,boolean success){
        this.success = success;
        this.message = message;
    }

	public static ResponseMessage deserialize(String result){
        ResponseMessage response = (ResponseMessage) JSON.deserialize(result,ResponseMessage.class);  
        return response;       
    }

}