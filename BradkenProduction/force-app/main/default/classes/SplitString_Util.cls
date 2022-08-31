public class SplitString_Util {
    @InvocableMethod
    public static List<List<String>> splitString(List<String>  stringWithSemicolons) {
        List<List<String>> listOfsStrList = new List<List<String>>();
        string inPutString = stringWithSemicolons[0].replaceAll('\\s+','');
        if(inPutString != null){
            listOfsStrList.add(inPutString.split(';'));
        	return listOfsStrList;
        }
        else
            return null;
    }
}