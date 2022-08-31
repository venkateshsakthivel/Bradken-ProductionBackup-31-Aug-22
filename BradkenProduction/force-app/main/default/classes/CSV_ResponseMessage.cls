public without sharing class CSV_ResponseMessage{
    public Boolean success;
    public string message;
   
    public CSV_ResponseMessage(String message,boolean success){
        this.success = success;
        this.message = message;
    }

	public static CSV_ResponseMessage deserialize(String result){
        CSV_ResponseMessage response = (CSV_ResponseMessage) JSON.deserialize(result, CSV_ResponseMessage.class);  
        return response;       
    }
	
    /*errorlog
    public static void insertException(Id rId, Logginglevel level, 
                                                    string module, Exception exp, 
                                                    Boolean notifyDev, Boolean notifyUser, 
                                                    String info, String note){
		try{
        	ExceptionLog__c expLog = ExceptionLogData.getExceptionObject(rId , level, module, exp,notifyDev, notifyUser,info, note);
            expLog.AdditionalInformation__c = info;
            expLog.SpecialNoteforUser__c = note;
        	insert expLog;
        }catch(Exception er){
            system.debug('Error in InsertExceptionlog method with Exception '+ er.getMessage() + ' StackTrace: ' + er.getStackTraceString());
        }
    }*/
}