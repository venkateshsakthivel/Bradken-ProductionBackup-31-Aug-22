@isTest
public class SplitString_Util_Test {
	@isTest
    static void testMethod1() {
        List<String>  stringWithSemicolons = new List<String>{'abc;xyz'};
        SplitString_Util.splitString(stringWithSemicolons);
    }
}