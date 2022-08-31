({
	searchProducts:function(component, event, helper,keyword){
        component.set("v.isSearching",true);
        var action = component.get("c.searchProducts");//getProducts
        var pricebookId = component.get("v.pricebook2Id");
        var quote = component.get("v.quote");
        action.setParams({keyword: keyword,pricebookId:pricebookId,accountId: quote.AccountId,currencyIsoCode : quote.CurrencyIsoCode});
        action.setCallback(this, function(response) {
            component.set("v.isSearching",false);
            var state = response.getState();
            if (state === "SUCCESS") {
                //Retain search results including seleted
				//var selectedProducts = component.get("v.selectedProducts");
                var results = JSON.parse(response.getReturnValue());
                var searchResults = [];
				var orderItemsMap = results.orderItems ? JSON.parse(results.orderItems) : {};
                if(results.customerPriceBookEntries){
                    //searchResults = [];
                    results.customerPriceBookEntries.forEach(function(p){
                        var prodDesc = results.customerProducts.forEach(function(cp){
                            if( cp.Product__c == p.Product2Id){
                                var label = p.Name+': '+(p.Product2.Description ? p.Product2.Description :'')+' || '+cp.Name+' : '+(cp.Customer_Product_Description__c?cp.Customer_Product_Description__c:'')+'';
                                searchResults.push({
                                    "label": label,
                                    "value": p.Id,
                                    "product":p,
                                    "orderitem": orderItemsMap[p.Product2Id],
                                    "customerProduct":cp,
                                    "sortfield":label
                                });
                            };
                        });
                        //var pd =  Array.isArray(prodDesc)? prodDesc[0]: prodDesc;
                        
                    });
                }
                results.priceBookEntries.forEach(function(p){
                    var label = p.Name+': '+(p.Product2.Description ? p.Product2.Description :'') ;
                    /*var customerPbs = searchResults.filter(function(cp) {
                        return p.Id == cp.value;
                    });
                    if(!customerPbs){
                    */    searchResults.push({
                            "label": label,
                            "value": p.Id,
                            "product":p,
                            "orderitem": orderItemsMap[p.Product2Id],
                            "customerProduct": {},
                            "sortfield":label
                            });
                    //}
                });
                //searchResults.sort(helper.sortObject("sortfield"));
                component.set("v.searchResults",searchResults);
            }
        });
        $A.enqueueAction(action); 
    },
    populatePricebookList:function(component, event, helper){
        var action = component.get("c.getPricebooks");
		var quote = component.get("v.quote");
        action.setParams({accountId: quote.AccountId });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var priceBooks = response.getReturnValue();
                var priceBookOptions = [];
                priceBooks.forEach(function(p){
                    priceBookOptions.push({
                        "label": p.Name,
                        "value": p.Id
                    });
                });
                component.set("v.pricebookoptions",priceBookOptions);
            }
        });
        $A.enqueueAction(action);  
    },
    saveQuote: function(component,event,helper){
        var action = component.get("c.updateQuotePricebook");
        action.setParams({quote : component.get("v.quote")});
        action.setCallback(this, function(response) {
			component.set("v.hideModal",true);
			var state = response.getState();
            if (state === "SUCCESS") {
                var result = JSON.parse(response.getReturnValue());
                if(result.success){
                    /*component.find('notifLib').showToast({
                        "title": $A.get("$Label.c.QuoteLineEditor_Header_Success"),
                        "message": $A.get("$Label.c.QuoteLineEditor_Save_Message"),
                        "variant":"success"
                    });*/
                    $A.get('e.force:refreshView').fire();
                    
                    var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
                    qliEditEvent.setParams({action: "reset",payload:""});
                    qliEditEvent.fire();
                }else{
                    component.find('notifLib').showToast({
                        "title": $A.get("$Label.c.QuoteLineEditor_Header_Error"),
                        "message": "Check logs"+result.message,
                        "variant":"error"
                    });
                    component.set("v.isPricebookChanged",false);
                    component.set("v.pricebook2Id",component.get("v.oldpricebook2Id"));
                }
            }else{
                component.find('notifLib').showToast({
                    "title": "Internal error",
                    "message": "Check logs",
                    "variant":"error"
                });
            }
        });
        $A.enqueueAction(action); 
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
    getQuoteLines:function(component, event, helper){
        var action = component.get("c.getQuoteLineItems");
        var quote = component.get("v.quote");
        action.setParams({quoteId: quote.Id});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var quoteLineItems = response.getReturnValue();
                var hasQuoteLines = (quoteLineItems.length > 0);
                component.set("v.hideModal",!hasQuoteLines);
                if(!hasQuoteLines){ 
                    var quote = component.get("v.quote");
                    var pricebook2Id = component.get("v.pricebook2Id");
                    quote.Pricebook2Id = pricebook2Id;
                    component.set("v.quote",quote);
                    helper.saveQuote(component, event, helper);
                }
            }
        });
        $A.enqueueAction(action); 
    },
})