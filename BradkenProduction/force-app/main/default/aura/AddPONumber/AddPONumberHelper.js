/**
 * @description       : 
 * @author            : TQDev
 * @group             : 
 * @last modified on  : 08-31-2020
 * @last modified by  : TQDev
 * Modifications Log 
 * Ver   Date         Author   Modification
 * 1.0   08-31-2020   TQDev   Initial Version
**/
({
    doRedirect:function(c,e,h){
        var workspaceAPI = c.find("workspace");
        
        workspaceAPI.isConsoleNavigation().then(function(isConsole) {
            if(isConsole){
                workspaceAPI.getFocusedTabInfo().then(function(response) {
                    workspaceAPI.openTab({
                        
                        pageReference: {
                            "type": "standard__component",
                            "attributes": {
                                "componentName": "c__AddPONumber"    
                            },    
                            "state": {
                                "c__recordId": c.get('v.recordId'),
                                "c__sourceTabId": response.tabId
                            }
                        },
                        focus: true
                    });
                })
            }
            else{
                //not in console -> assumed that the quick action is called from lex.
                var navService = c.find("navService");
                navService.navigate({
                    "type": "standard__component",
                    "attributes": {
                        "componentName": "c__AddPONumber"    
                    },    
                    "state": {
                        "c__recordId": c.get('v.recordId')
                    }
                    
                });
            }
        }); 
    },
    getFieldsToCopy : function(c,e,h) {
        var action = c.get("c.getOpportunityProductFieldsToCopy");
        action.setCallback(this, function(response){
			var state = response.getState();
            if(state === 'SUCCESS'){
                c.set('v.fieldsToCopy',JSON.parse(response.getReturnValue()));
            }else{
                c.find('notifLib').showToast({
                    "variant": "error",
                    "title": "Fields To Copy missing",
                    "message": ""
                });
            }
        });
        $A.enqueueAction(action);
    },
    getOppLines : function(c,e,h) {
        var spinner = c.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        var getOppLinesAction = c.get("c.getOpportunityLines");
        getOppLinesAction.setParams({
            recordId : c.get("v.recordId")
        });
        getOppLinesAction.setCallback(this, function(response){
            c.set('v.initDone',true);
            $A.util.toggleClass(spinner, "slds-hide");
            var workspaceAPI = c.find("workspace");
            workspaceAPI.isConsoleNavigation().then(function(isConsole) {
                if(isConsole){
                    workspaceAPI.getFocusedTabInfo().then(function(response) {
                        workspaceAPI.setTabLabel({
                            tabId: response.tabId,
                            label: $A.get("$Label.c.PO_Tab_Label")
                        });
                    });
                }
            });
            var state = response.getState();
            if(state === 'SUCCESS'){
                var opportunityLines = response.getReturnValue();
                var purchaseOrderLines = [];
                var accountNumber;
                opportunityLines.forEach(function(oli){
                    accountNumber = oli.Opportunity.Account.AccountNumber;
                    var po = {};
                    po.oli = oli;
                    po.Quantity__c = 0;
                    po.DespatchWarehouse__c = '';
                    po.OpportunityLineItem__c = oli.Id;
                    po.Product__c = oli.Product2Id;
                    if(oli.AvailableQuantity__c > 0){
                        purchaseOrderLines.push(po);
                    }
                });
                if(!accountNumber){
                	$A.util.toggleClass(c.find("PO_No_UNIBIS_Account"), "slds-hide");                    
                }
                else if(purchaseOrderLines.length == 0){
                	$A.util.toggleClass(c.find("PO_No_OpportunityLines_Message"), "slds-hide");
                }
                else{
					c.set("v.purchaseOrderLines",purchaseOrderLines);
                	h.getFieldsToCopy(c,e,h);
                }
            }else{
                c.find('notifLib').showToast({
                    "variant": "error",
                    "title": $A.get("$Label.c.PO_Error_OppLine"),
                    "message": ""
                });
            }
        });
        $A.enqueueAction(getOppLinesAction);
    },
    validate:function(c,e,h){
        var isValid = true;
        var purchaseOrderLines = c.get("v.purchaseOrderLines");
        var poNumber = c.get("v.po_number");
        var warehouse = c.get("v.po_warehouse");
        var incompletePOL = false;
        var poCount = purchaseOrderLines.length;
        purchaseOrderLines.forEach(function(po){
            if(po.Quantity__c > 0 && po.DespatchWarehouse__c == ""){
                incompletePOL = true;
            }
            if(po.Quantity__c == 0){
                poCount--;
            }
        });
        if( poCount < 1){
            c.find('notifLib').showToast({
                "variant": "error",
                "title": c.get('v.pol_objectinfo').fields.Quantity__c.label + ' missing',
                "message": ""
            });
            isValid = false;
        }else{
            if(poNumber == ""){
                isValid = false;
                c.find('notifLib').showToast({
                    "variant": "error",
                    "title": $A.get("$Label.c.PO_Error_RequiredField"),
                    "message": ""
                });
            }
        }
        var qf = c.find('pol_quantity');
        if(qf && isValid){
            if(Array.isArray(qf)){
                isValid = qf.reduce(function (validSoFar, inputCmp) {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
                }, true);
            }else{
                qf.reportValidity();
                isValid = qf.checkValidity();
            }
        } 
        return isValid;
    },
    saveRecords : function(c,e,h,customerPO,polItems,opportunityLines) {
        var spinner = c.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        var insertRecordsAction = c.get("c.insertRecords");
        insertRecordsAction.setParams({
            customerPO: customerPO,
            purchaseOrderLines: polItems,
            opportunityLines: opportunityLines
        });
        insertRecordsAction.setCallback(this, function(response){
            $A.util.toggleClass(spinner, "slds-hide");
            c.set('v.showConfirm',false);
            var state = response.getState();
            if(state === 'SUCCESS'){
                if(response.getReturnValue() ==  'QuantityChanged'){
					c.find('notifLib').showToast({
                        "variant": "error",
                        "title": $A.get("$Label.c.PO_Error_Insert"),
                        "message": $A.get("$Label.c.PO_Quantity_Exceeded_Message")
                    }); 
                }
                if(response.getReturnValue() == 'ok'){
                    c.find('notifLib').showToast({
                        "variant": "success",
                        "title": $A.get("$Label.c.PO_Saved"),
                        "message": ""
                    });
                    h.closeTab(c,e,h);
                }
                
            }else{
                var errMsg ;
                if(response.getError()){
                    errMsg = response.getError()[0].message;
                    if(errMsg.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION,')){
                        errMsg = errMsg.split('FIELD_CUSTOM_VALIDATION_EXCEPTION,')[1];
                    }
                }
                c.find('notifLib').showToast({
                    "variant": "error",
                    "title": $A.get("$Label.c.PO_Error_Insert"),
                    "message": errMsg
                });
            }
        });
        $A.enqueueAction(insertRecordsAction);
    },
    closeTab:function(c,e,h){
        var workspaceAPI = c.find("workspace");
        workspaceAPI.isConsoleNavigation().then(function(isConsole) {
            if(isConsole){
                workspaceAPI.getFocusedTabInfo().then(function(response) {
                    //workspaceAPI.refreshTab({tabId: response.parentTabId ,includeAllSubtabs: true});
                    workspaceAPI.refreshTab({tabId: c.get("v.pageReference").state.c__sourceTabId ,includeAllSubtabs: true});
                    workspaceAPI.closeTab({tabId: response.tabId});
                })
            }else{
                var navService = c.find("navService");
                navService.navigate({
                    "type": "standard__recordPage",
                    "attributes": {
                        "recordId": c.get('v.recordId'),
                        "objectApiName": "Opportunity",
                        "actionName": "view"
                    }
                });
            }
        });
    }
})