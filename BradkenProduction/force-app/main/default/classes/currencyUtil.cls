public without sharing class currencyUtil {
    private static Map<ID,DatedConversionRate> dcrIdToDcrMap;

    public static Decimal convertToOrgCurrency(Decimal currencyVal, String currencyIso, Date currencyDate){
        Decimal res;
        //build map once for transaction
        if(dcrIdToDcrMap == null){
            dcrIdToDcrMap = new Map<ID,DatedConversionRate> ([select id, isoCode, conversionrate, nextStartDate, startDate from DatedConversionRate]);
        }
        for (DatedConversionRate dcr: dcrIdToDcrMap.values()) {
            if (dcr.isoCode != currencyIso)                                         continue;   // look for a match in table against input currency
            if (currencyDate < dcr.startDate || currencyDate >= dcr.nextStartDate)  continue;   // not in the range of effective dates
            System.debug(LoggingLevel.INFO,'Converting using dcr: ' + dcr);
            res =  currencyVal / dcr.conversionRate;
            break;  
        }
        return res.setScale(2);
    }

    public static Decimal convertFromOrgCurrency(Decimal currencyVal, String currencyIso, Date currencyDate){
        Decimal res;
        if(dcrIdToDcrMap == null){
            dcrIdToDcrMap = new Map<ID,DatedConversionRate> ([select id, isoCode, conversionrate, nextStartDate, startDate from DatedConversionRate]);
        }
        for (DatedConversionRate dcr: dcrIdToDcrMap.values()) {
            if (dcr.isoCode != currencyIso)                                         continue;   // look for a match in table against input currency
            if (currencyDate < dcr.startDate || currencyDate >= dcr.nextStartDate)  continue;   // not in the range of effective dates
            System.debug(LoggingLevel.INFO,'Converting using dcr: ' + dcr);
            res =  currencyVal * dcr.conversionRate;
            break;  
        }
        return res.setScale(2);
    }

    public static Decimal convertToNonOrgCurrency(Decimal currencyVal, String fromIsoCode, String toIsoCode, Date currencyDate){
        Decimal res;
        if(dcrIdToDcrMap == null){
            dcrIdToDcrMap = new Map<ID,DatedConversionRate> ([select id, isoCode, conversionrate, nextStartDate, startDate from DatedConversionRate]);
        }
        for(DatedConversionRate dcr : dcrIdToDcrMap.values()){
            if (dcr.isoCode != fromIsoCode)                                         continue;   // look for a match in table against input currency
            if (currencyDate < dcr.startDate || currencyDate >= dcr.nextStartDate)  continue;   // not in the range of effective dates
            Decimal rez = convertToOrgCurrency(currencyVal, fromIsoCode, currencyDate);
            res = convertFromOrgCurrency(rez, toIsoCode, currencyDate);
            break;
        }
        return res.setScale(2);
    }

    public static String getIsoRate(String IsoCode, Date currencyDate){
        String rate;
        if(dcrIdToDcrMap == null){
            dcrIdToDcrMap = new Map<ID,DatedConversionRate> ([select id, isoCode, conversionrate, nextStartDate, startDate from DatedConversionRate]);
        }
        for(DatedConversionRate dcr : dcrIdToDcrMap.values()){
            if (dcr.isoCode != isoCode)                                         continue;   // look for a match in table against input currency
            if (currencyDate < dcr.startDate || currencyDate >= dcr.nextStartDate)  continue;   // not in the range of effective dates
            rate = String.valueOf(dcr.conversionRate.setScale(2));
            break;
        }
        return rate;
    }
}