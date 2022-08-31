/**
 * @description       : 
 * @author            : TQDev
 * @group             : 
 * @last modified on  : 09-11-2020
 * @last modified by  : TQDev
 * Modifications Log 
 * Ver   Date         Author   Modification
 * 1.0   09-11-2020   TQDev   Initial Version
**/
({
    getPayload : function(component, event, helper) {
         var supplierId = component.get("v.supplierId");
        var warehouseId = component.get("v.selectedWarehouse").Id;

        var payload = {};
        if(supplierId){
            payload.Supplier__c = supplierId;
        }
        if(warehouseId){
            payload.Despatch_Warehouse__c = warehouseId;
        }
        if(!Object.entries(payload).length) return;
        return payload;
    }
})