@isTest
public with sharing class currencyUtilTest {
    @isTest static void testCurrecnyConversion(){
        Decimal toCompanyCurrency = currencyUtil.convertToOrgCurrency(20.00, 'CAD', Date.Today());
        system.debug(toCompanyCurrency);

        Decimal fromOrgCurrency = currencyUtil.convertFromOrgCurrency(20.00, 'CAD', Date.today());
        system.debug(fromOrgCurrency);

        Decimal toNonOrgCurrency = currencyUtil.convertToNonOrgCurrency(20.00, 'CAD', 'CLP', Date.today());
        system.debug(toNonOrgCurrency);
    }
}