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
        helper.getQuoteLines(component, event, helper);
        var quoteLineEditorConfig = component.get("v.quoteLineEditorConfig");
        var selectedColumns = [];
        quoteLineEditorConfig.forEach(function(f){
            if(f.DefaultChecked__c){
                selectedColumns.push(f);
            }
        });
        selectedColumns.sort(helper.sortObject("SortOrder__c"));
        component.set("v.selectedColumns",selectedColumns);
    },
    doAction : function(component, event, helper) {
        var quote = component.get("v.quote");
        var params = event.getParam("arguments");
        var action = event.getParam("action");
        if(action == "removeItem"){
            var itemId =  event.getParam("payload");
            var quoteLineItems = component.get("v.quoteLineItems");
            var quoteLineItemsToDelete = component.get("v.quoteLineItemsToDelete");
            var removedQLI = quoteLineItems.splice(itemId,1);
            quoteLineItemsToDelete.push(removedQLI[0]);
            component.set("v.quoteLineItems",quoteLineItems);
            component.set("v.quoteLineItemsToDelete",quoteLineItemsToDelete);
			helper.recalculateTotal(component,event,helper,itemId);
            return;
        }
        if(action == "recalculateTotal"){
            helper.recalculateTotal(component,event,helper);
        }
        if (params) {
            if(params.action == "AddSearchedProducts"){
                var selectedProducts = JSON.parse(params.payload);
                var quoteLineItems = component.get("v.quoteLineItems");
                selectedProducts.forEach(function(sp){
                    var quoteLine = {};
                    quoteLine['PricebookEntryId'] = sp.value;
                    quoteLine['QuoteId'] = quote.Id;
                    quoteLine['PricebookEntryIdValues'] = sp.product;
                    quoteLine['OrderItem'] = sp.orderitem;
                    quoteLine['TotalPrice'] = 0;
                    quoteLine['Total_Margin_Amount__c'] = 0;
                    quoteLine['Total_Margin_Percent__c'] = 0;
                    quoteLine['customerProduct'] = sp.customerProduct;
                    quoteLine['Product2Id'] = sp.product.Product2.Id;
                    /*if(sp.product.Name != ''){
                        quoteLine['Bradken_Part_Number__c'] = sp.product.Name;
                    }
                    else if(sp.product.Product2.Name != ''){
                        quoteLine['Bradken_Part_Number__c'] = sp.product.Product2.Name;
                    }*/
                    if(sp.product.Product2.Vendor__c != ''){
                        quoteLine['Supplier__c'] = sp.product.Product2.Vendor__c;
                    }
                    
                    quoteLineItems.push(quoteLine);
                });
                // console.log('qOrder', quotline.OrderItem);
                component.set("v.quoteLineItems",quoteLineItems);
                helper.handleQLICount(component);
            }
            if(params.action == "reset"){
				component.set("v.quoteLineItemsToDelete",[]);
                component.set("v.quoteLineItems",[]);
                helper.getQuoteLines(component, event, helper);
                helper.handleQLICount(component);
            }
			if(params.action == "saveChanges"){
               helper.saveChanges(component, event, helper);
               helper.handleQLICount(component);
            }
            if(params.action == "UpdateQLIFields"){
                var qliFields = params.payload;
                var quoteLineItems = component.get("v.quoteLineItems");
                quoteLineItems.forEach((qli)=>{
                    Object.keys(qliFields).forEach((field)=>{
                        qli[field] = qliFields[field];
                    })
                });
                component.set("v.quoteLineItems",quoteLineItems);
                var qlrs = component.find('QLR');
                if(qlrs){
                    if(Array.isArray(qlrs)){
                        qlrs.forEach(function(quoteli){
                            quoteli.quoteLineRow('UpdateQLIFields', qliFields);
                        });
                    }
                    else{
                        qlrs.quoteLineRow('UpdateQLIFields', qliFields);
                    }
                }
            }
            if(params.action == "calculateProductAndFreightCosts"){
                helper.calculateProductAndFreightCosts(component, event, helper);
            }
            return;
        }
        
    }
})