/**
 * @description       : 
 * @author            : TQDev
 * @group             : 
 * @last modified on  : 08-21-2020
 * @last modified by  : TQDev
 * Modifications Log 
 * Ver   Date         Author   Modification
 * 1.0   08-21-2020   TQDev   Initial Version
**/
({
    doInit : function(c,e,h) {
        $A.util.toggleClass(c.find("mySpinner"), "slds-hide");
        var pageRef = c.get("v.pageReference");
        var recId;
        if(pageRef){
            recId = pageRef.state['c__recordId'];
        }
        if(!recId){
            window.setTimeout($A.getCallback(function() {
                h.doRedirect(c,e,h)
            }), 1000);
        }else{
            $A.util.toggleClass(c.find("mySpinner"), "slds-hide");
            c.set('v.recordId',recId);
            h.getOppLines(c,e,h);
        }
    },
    handleLoad: function (c,e,h) {
        if(!c.get('v.pol_objectinfo')){
            c.set('v.pol_objectinfo', e.getParams().recordUi.objectInfo);
        }
        //default the warehouse
        var idx = Number(e.getSource().get("v.class").split('pol_warehouse_form_').pop());
        var purchaseOrderLines = c.get("v.purchaseOrderLines");
        var oli = purchaseOrderLines[idx].oli;
        var forms = c.find("pol_warehouse");
        if(Array.isArray(forms)){
            forms[idx].set("v.value",oli.Warehouse__c);
            purchaseOrderLines[idx].DespatchWarehouse__c = oli.Warehouse__c;
        }else{
            forms.set("v.value",oli.Warehouse__c);
            purchaseOrderLines[0].DespatchWarehouse__c = oli.Warehouse__c;
        }
        c.set("v.purchaseOrderLines",purchaseOrderLines);

    },
    handleCancel: function (c,e,h) {
        h.closeTab(c,e,h);
    },
    handleChange:function(c,e,h){
        var changedVal = e.getSource().get("v.value");
        var fieldName = e.getSource().get("v.class");
        if(fieldName == 'po_name'){
            c.set('v.po_number',changedVal);
        }
        if(fieldName == 'po_warehouse'){
            c.set('v.po_warehouse',changedVal);
            var purchaseOrderLines = c.get("v.purchaseOrderLines");
            var polwh = c.find("pol_warehouse");
            if(polwh){
                if(Array.isArray(polwh)){
                    polwh.forEach(function(f,i){
                        f.set("v.value", changedVal);
                        purchaseOrderLines[i].DespatchWarehouse__c = changedVal;
                    });
                }else{
                    polwh.set("v.value", changedVal);
                    purchaseOrderLines[0].DespatchWarehouse__c = changedVal;
                }
            }
            c.set("v.purchaseOrderLines",purchaseOrderLines);
        }
        if(fieldName == 'selectAllPol'){
            var purchaseOrderLines = c.get("v.purchaseOrderLines");
            var polwh = c.find("pol_quantity");
            var isChecked = e.getSource().get("v.checked");
            if(polwh){
                if(Array.isArray(polwh)){
                    polwh.forEach(function(f,i){
                        purchaseOrderLines[i].Quantity__c = isChecked ? purchaseOrderLines[i].oli.AvailableQuantity__c :0;
                    });
                }else{
                    purchaseOrderLines[0].Quantity__c = isChecked? purchaseOrderLines[0].oli.AvailableQuantity__c :0;
                }
            }
            c.set("v.purchaseOrderLines",purchaseOrderLines);
        }
        if(fieldName.startsWith('pol_warehouse_')){
            var idx = fieldName.split('pol_warehouse_')[1];
            var purchaseOrderLines = c.get("v.purchaseOrderLines");
            purchaseOrderLines[idx].DespatchWarehouse__c = changedVal;
            c.set("v.purchaseOrderLines",purchaseOrderLines);
        }
    },
    handleValidate:function(c,e,h){
        if(h.validate(c,e,h)){
            c.set("v.showConfirm",true);
        }
    },
    handleCancelConfirm:function(c,e,h){
        c.set("v.showConfirm",false);
    },
    handleSaveConfirm:function(c,e,h){
        var purchaseOrderLines = c.get("v.purchaseOrderLines");
        
        var customerPO = c.get("v.po");
        customerPO.Despatch_Warehouse__c = c.get('v.po_warehouse');
        customerPO.Name = c.get('v.po_number');
        customerPO.Opportunity__c = c.get("v.recordId");
        customerPO.Status__c = 'Complete';
        customerPO.CurrencyISOCode =  purchaseOrderLines[0].oli.CurrencyISOCode ;
        customerPO.Account__c = purchaseOrderLines[0].oli ? purchaseOrderLines[0].oli.Opportunity.AccountId : customerPO.Account__c;
        
        var opportunityLines = [];
        var polItems = [];
        var fieldsToCopy = c.get('v.fieldsToCopy');
        purchaseOrderLines.forEach(function(f){
            if(f.Quantity__c > 0){
                var pol = Object.assign({},f);
                pol.sobjectType = 'Purchase_Order_Line_Item__c';
                if(fieldsToCopy){
                    fieldsToCopy.forEach(function(fc){
						pol[fc.fieldPath] = f.oli[fc.fieldPath];                      
                    });
                }
                pol.UnitPrice__c = f.oli.UnitPrice;
                delete pol.oli;
                polItems.push(pol);
                
                var oli = {};
                oli.sobjectType = 'OpportunityLineItem';
                oli.Id = f.oli.Id;
                var oq = (f.oli.OrderedQuantity__c) ? f.oli.OrderedQuantity__c : 0;
                oli.AvailableQuantity__c = f.oli.AvailableQuantity__c;
                oli.OrderedQuantity__c = Number(oq)+Number(pol.Quantity__c);
                opportunityLines.push(oli);
            }
        });
        h.saveRecords(c,e,h,customerPO,polItems,opportunityLines);
    },
})