/**
 * @description       : 
 * @author            : TQDev
 * @group             : 
 * @last modified on  : 09-10-2020
 * @last modified by  : TQDev
 * Modifications Log 
 * Ver   Date         Author   Modification
 * 1.0   08-31-2020   TQDev   Initial Version
**/
({
    doInit : function(component, event, helper) {
        $A.util.toggleClass(component.find("mySpinner"), "slds-hide");
        var pageRef = component.get("v.pageReference");
        var recId;
        if(pageRef){
            recId = pageRef.state['c__recordId'];
        }
        
        
        if(!recId){
              window.setTimeout($A.getCallback(function() {
                helper.doRedirect(component, event, helper)
            }), 1000);
        }else{
            $A.util.toggleClass(component.find("mySpinner"), "slds-hide");
            component.set('v.recordId',recId);
            helper.getQuoteDetails(component, event, helper);
            helper.getQuoteLineEditorConfig(component, event, helper);
            
        }
               
    },
	handleFieldSelectChange: function (component, event) {
		var selectedFields = component.get("v.selectedFields");
        var fieldOptions = component.get("v.fieldOptions");
        component.find("SelectAllCols").set("v.checked",selectedFields.length == fieldOptions.length);
    },
    updateSelectedFields:function(component, event, helper) {
        var selectedFields = component.get("v.selectedFields");
        var quoteLineEditorConfig = component.get("v.quoteLineEditorConfig");
        quoteLineEditorConfig.forEach(function(f){
            if(f.Display__c != 'Hidden' && f.Display__c != 'Required'){
                f.DefaultChecked__c = false;
                f.DefaultChecked__c = selectedFields.filter(function(sf){
                     return f.FieldAPI__c == sf;
                })[0];
            }
        });
        component.set("v.quoteLineEditorConfig",quoteLineEditorConfig);
		component.set("v.hideFieldsToDisplay",true);
    },
    handleFieldSelect:function(component, event, helper) {
        var checkedState = event.getSource().get("v.checked");
        var fieldOptions = component.get("v.fieldOptions");
		var selectedFields = [];

        fieldOptions.forEach(function(f){
            if(checkedState){
            	selectedFields.push(f.value);
            }
        });
        component.set("v.selectedFields",selectedFields);
		component.find("SelectAllCols").set("v.checked",selectedFields.length == fieldOptions.length);

    },
    doAction : function(component, event, helper) {
        var action = event.getParam("action");
        if(action == "AddSearchedProducts"){
            var searchedProducts =  event.getParam("payload");
            component.find('quoteLineTable').quoteLineTableAction(action,searchedProducts);
        }
        if(action == "reset"){
            component.find('quoteLineTable').quoteLineTableAction(action,'');
			component.find('quoteProductSearch').quoteProductSearch(action,'');
        }
        if(action == "UpdateQLIFields"){
            component.find('quoteLineTable').quoteLineTableAction(action,event.getParam("payload"));
        }
        if(action == "recalculateTotalResult"){
            var quoteTotals =  event.getParam("payload");
			component.find('quoteProductSearch').quoteProductSearch(action,quoteTotals);
        }
        if(action == "saveError"){
           //Handle save error
        }
        if(action == "closeTab"){
            helper.closeTab(component,event,helper);
        }
        
        
    },
    toggleFieldsToDisplay :function(component, event, helper) {
        component.set("v.hideFieldsToDisplay",false);
		var selectedFields = component.get("v.selectedFields");
        var fieldOptions = component.get("v.fieldOptions");
        component.find("SelectAllCols").set("v.checked",selectedFields.length == fieldOptions.length);
  
    },
    warnCloseEditor:function(component, event, helper) {
        component.set("v.hideModal",false);
    },
    closeQuickAction:function(component, event, helper) {
        helper.closeTab(component,event,helper);
    },
    closeModal:function(component, event, helper) {
        component.set("v.hideModal",true);
        component.set("v.hideFieldsToDisplay",true);
    },
    saveChanges:function(component, event, helper) {
        component.find('quoteLineTable').quoteLineTableAction("saveChanges");
    },
    handleQLICountEvent:function(component, event, helper){
        component.set("v.disableWarehouseSearch", event.getParam("disableWarehouseSearch"));
    },
    
    updateAllItemsConfirmed:function(component, event, helper){
        component.find("quoteLineTable").quoteLineTableAction("calculateProductAndFreightCosts");
        component.set('v.confirmUpdateModal', false);
    },
    
    updateAllItemsCancelled:function(component, event, helper){
        component.set("v.confirmUpdateModal",false);
    },
    
    updateAllItems:function(component, event, helper){
        component.set("v.confirmUpdateModal",true);        
    }
})