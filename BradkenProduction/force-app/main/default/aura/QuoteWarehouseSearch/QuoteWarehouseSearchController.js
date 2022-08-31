/**
 * @description       : 
 * @author            : TQDev
 * @group             : 
 * @last modified on  : 09-11-2020
 * @last modified by  : TQDev
 * Modifications Log 
 * Ver   Date         Author   Modification
 * 1.0   08-31-2020   TQDev   Initial Version
**/
({
    handleWarehouseSelect:function(component, event, helper){
        component.set('v.selectedWarehouse.Id', event.getParam("value")[0]);
    },
    handleNoConfirm:function(component, event, helper){
        component.set('v.isConfirmModalOpen',false);
    },
    handleYesConfirm:function(component, event, helper){
        var payload = helper.getPayload(component, event, helper);
        component.set('v.isConfirmModalOpen',false);
        var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
            qliEditEvent.setParams({action: "UpdateQLIFields",payload:JSON.stringify(payload)});
            qliEditEvent.fire();
            component.set("v.supplierId",'');
            component.set("v.selectedWarehouse.Id",'');
            component.find('warehouseLookup').set("v.value",'');
    },
    handleUpdateAll:function(component, event, helper){
        component.set('v.isConfirmModalOpen',(helper.getPayload(component, event, helper)));
    }
})