/**
 * @description       : 
 * @author            : TQDev
 * @group             : 
 * @last modified on  : 08-31-2020
 * @last modified by  : TQDev
 * Modifications Log 
 * Ver   Date         Author   Modification
 * 1.0   08-14-2020   TQDev   Initial Version
**/
({
    getQuoteLines:function(component, event, helper){
        var action = component.get("c.getQuoteLineItems");
        var quote = component.get("v.quote");
        
        action.setParams({quoteId: quote.Id});
        //var p = new Promise(function(resolve, reject){
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    
                    var quoteLineItems = response.getReturnValue();
                    component.set("v.quoteLineItems",quoteLineItems);
                    helper.getOrderItems(component, event, helper);
                    helper.handleQLICount(component, event, helper);
                }
            });
            $A.enqueueAction(action);
    },
    getOrderItems:function(component, event, helper){
        var action = component.get("c.getOrderItems");
        var quote = component.get("v.quote");
        var quoteLineItems = component.get("v.quoteLineItems");
        var productIds = [];
        if(quoteLineItems.length > 0){
            quoteLineItems.forEach(function(qli){
                productIds.push(qli.Product2Id);
            });
        }
        action.setParams({productIds:productIds,accountId: quote.AccountId});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var orderItems = JSON.parse(response.getReturnValue());
                if(orderItems){
                    quoteLineItems.forEach(function(qli){
                        qli['OrderItem'] = orderItems[qli.Product2Id];
                    });
                    component.set("v.quoteLineItems",quoteLineItems);
                }
            }
        });
        if(productIds.length > 0){
            $A.enqueueAction(action); 
        }
    },
    sortObject : function compareValues(key, order) {
        return function(a, b){
            if(!a.hasOwnProperty(key) || 
               !b.hasOwnProperty(key)) {
                return 0; 
            }
            
            const varA = (typeof a[key] === 'string') ? 
                a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string') ? 
                b[key].toUpperCase() : b[key];
            
            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order == 'desc') ? 
                (comparison * -1) : comparison
            );
        }
    },
    saveChanges : function(component, event, helper) {
        var quoteLineItems = component.get("v.quoteLineItems");
        var quoteLineItemsToDelete = component.get("v.quoteLineItemsToDelete");
        var quoteLineIdsToDelete = [],quoteLineItemsToSave = [];
        
      
        
        //Get ids to delete
        quoteLineItemsToDelete.forEach(function(qli){
            if(qli.Id){
                quoteLineIdsToDelete.push(qli.Id);
            }
        });
        var toSaveCount =  quoteLineItems.length ;
        //deployment error, on clicking of cancel extra empty quotelineitem is getting added to the list
        /*var toSaveCount=0;
        for(var i=0;i<quoteLineItems.length;i++){
            if(quoteLineItems[i].Id){
                toSaveCount++;
            }
            else{
                quoteLineItems.splice(i,1);
            }
        }*/
        //deployment error end

        //get records to save
         if(toSaveCount > 0){
             
                        
            var qlrs = component.find('QLR');
            if(Array.isArray(qlrs)){
                qlrs.forEach(function(qlr){
                    var qli = qlr.quoteLineRow('getQuoteLineItemsObject');
                    if(qli){
                        
                        quoteLineItemsToSave.push(qli);
                                     
                    }
                }); 
            }
            else{
                var qli = qlrs.quoteLineRow('getQuoteLineItemsObject');
                if(qli){
                    
                    
                    quoteLineItemsToSave.push(qli);
                    

                }
            }
        }
        
       
        
        
        
        var validQliCount = quoteLineItemsToSave.length;
        if(toSaveCount != validQliCount){
            var errorCount = toSaveCount-validQliCount;
            var errorMessage = $A.get("$Label.c.QuoteLineEditor_Error_Validation")+' : '+errorCount ;
            component.find('notifLib').showToast({
                "title": $A.get("$Label.c.QuoteLineEditor_Header_Error"),
                "message": errorMessage,
                "variant":"error"
            });
            var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
            qliEditEvent.setParams({action: "saveError",payload:errorMessage});
            qliEditEvent.fire();
            return;
        }
        
         
       
                    
        var action = component.get("c.saveQuoteLines");
        
           
        
        action.setParams({quoteLineItemsToSave: quoteLineItemsToSave,
                          quoteLineIdsToDelete: quoteLineIdsToDelete});
        
      
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            
            
            if (state === "SUCCESS") {
                var result = JSON.parse(response.getReturnValue());
                if(result.success){
                    component.find('notifLib').showToast({
                        "title": $A.get("$Label.c.QuoteLineEditor_Header_Success"),
                        "message": $A.get("$Label.c.QuoteLineEditor_Save_Message"),
                        "variant":"success"
                    });
                    
                    var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
                    qliEditEvent.setParams({action: "closeTab",payload:"closeTab"});
                    qliEditEvent.fire();
                    return;
                }else{
                    component.find('notifLib').showToast({
                        "title": $A.get("$Label.c.QuoteLineEditor_Header_Error"),
                        "message": "Check logs"+result.message,
                        "variant":"error"
                    });
                    var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
                    qliEditEvent.setParams({action: "saveError",payload:"Check logs"+result.message});
                    qliEditEvent.fire();
                }
            }else{
                component.find('notifLib').showToast({
                    "title": "Internal error",
                    "message": "Check logs",
                    "variant":"error"
                });
            }
            //$A.get("e.force:closeQuickAction").fire();
        });
        $A.enqueueAction(action); 
    },
    recalculateTotal:function(component,event,helper,skipIndex){
        var qliupdated = [];
        var quoteTotals = {
            total: 0
        };
        var qlrs = component.find('QLR');
        if(qlrs){
            if(Array.isArray(qlrs)){
                qlrs.forEach(function(qlr){
                    var qli = qlr.quoteLineRow('getQuoteLine');
                    if(qli){
                        qliupdated.push(qli);
                    }
                }); 
            }
            else{
                var qli = qlrs.quoteLineRow('getQuoteLine');
                if(qli){
                    qliupdated.push(qli);
                }
            }
            var total = 0
            qliupdated.forEach(function(qli,i){
                if(skipIndex != i){
                	total += qli.Line_Item_Sell_Price__c;
                }
            });
            quoteTotals.total = total;
        }else{
            quoteTotals.total = 0;
        }
        
        var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
        qliEditEvent.setParams({action: "recalculateTotalResult",payload:JSON.stringify(quoteTotals)});
        qliEditEvent.fire();
    },
    handleQLICount : function(component, event, helper){
        if(component.get("v.quoteLineItems").length > 0){
            var QLICountEvent = component.getEvent("QuoteLineItemCountEvent");
            QLICountEvent.setParams({
                disableWarehouseSearch : false
            });
            QLICountEvent.fire();
        }
        else{
            var QLICountEvent = component.getEvent("QuoteLineItemCountEvent");
            QLICountEvent.setParams({
                disableWarehouseSearch : true
            });
            QLICountEvent.fire();
        }
    },
    calculateProductAndFreightCosts:function(component, event, helper){
        component.set('v.Spinner', true);
        var qliList = [];
        var qlrs = component.find('QLR');
        if(Array.isArray(qlrs)){
            qlrs.forEach(function(qlr){
                var qli;
                try{
                    qli = qlr.quoteLineRow('getQuoteLineItemsObject');
                }
                catch(err){
                    //oops
                }
                if(qli){
                    qliList.push(qli);
                }
            }); 
        }
        else{
            var qli = qlrs.quoteLineRow('getQuoteLineItemsObject');
            if(qli){
                qliList.push(qli);
            }
        }
        var action = component.get('c.calculateProductAndFreightCosts');
        action.setParams({
            quoteLineItems : qliList
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                let result =response.getReturnValue();
                var qlrs = component.find('QLR');
                if(qlrs){
                    if(Array.isArray(qlrs)){
                        qlrs.forEach(function(quoteli,idx){
                            if(result[idx]){
                                quoteli.updateProductAndFreightCosts(result[idx].Product_Cost__c, result[idx].Freight_Cost__c, result[idx].Last_Updated_Date__c, result[idx].Product_Cost_Rate__c, result[idx].Freight_Cost_Rate__c);
                            }
                        });
                        
                    }
                    else if(result[0]){
                        qlrs.updateProductAndFreightCosts(result[0].Product_Cost__c, result[0].Freight_Cost__c,result[0].Last_Updated_Date__c.Supplier__c, result[0].Product_Cost_Rate__c, result[0].Freight_Cost_Rate__c)
                    }
                }
                component.set('v.Spinner', false);
            }
            else if(state === "ERROR"){
                component.set('v.Spinner', false);
                console.log('error has occurred');
            }
        });
        if(qliList.length){
        	$A.enqueueAction(action);
        }else{
			component.set('v.Spinner', false);
        }
    }
})