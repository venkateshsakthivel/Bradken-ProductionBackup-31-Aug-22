({
	doInit : function(component, event, helper) {
        var quote = component.get("v.quote");
        component.set("v.pricebook2Id",quote.Pricebook2Id);
        component.set("v.oldpricebook2Id",quote.Pricebook2Id);
		helper.populatePricebookList(component, event, helper);
	},
    doAction : function(component, event, helper) {
		var params = event.getParam("arguments");
        if (params) {
            if(params.action == "reset"){
				component.set("v.selectedProducts",[]);
            	component.set("v.searchResults",[]);
            	component.find("lookupInput").set("v.value",'');
				component.set("v.hideImportQLI",true);
                component.set("v.hideModal",true);

            }
            if(params.action == "recalculateTotalResult"){
				component.set("v.quoteTotal",JSON.parse(params.payload));
            }
        }
	},
    handleModalAction : function(component, event, helper) {
		var selectedValue = event.getSource().get("v.name");
        if(selectedValue == "modalSave"){
            component.set("v.selectedProducts",[]);
            component.set("v.searchResults",[]);
            component.find("lookupInput").set("v.value",'');
			component.set("v.isPricebookChanged",true);
			var quote = component.get("v.quote");
            var pricebook2Id = component.get("v.pricebook2Id");
            quote.Pricebook2Id = pricebook2Id;
            component.set("v.quote",quote);
            helper.saveQuote(component, event, helper);
        }
		if(selectedValue == "modalCancel"){
			component.set("v.hideImportQLI",true);
			component.set("v.hideModal",true);
            component.set("v.isPricebookChanged",false);
			component.set("v.pricebook2Id",component.get("v.oldpricebook2Id"));
        }
    },
    handlePricebookChange : function(component, event, helper) {
        if(component.get("v.oldpricebook2Id") != component.get("v.pricebook2Id")){
			helper.getQuoteLines(component, event, helper); 
        }
	},
    handleKeyUp:function(component, event, helper){
		var keyword = component.find("lookupInput").get("v.value");
        if(keyword != '' && keyword.length > 2){        //if (event.keyCode === 13) {
        	helper.searchProducts(component, event, helper,keyword);
        }
        if(keyword == ''){
            component.set("v.searchResults",[]);
        }
    },
    handleItemAdd:function (component, event,helper) {
        var selectedValue = event.getSource().get("v.name");
        var selectedProducts = component.get("v.selectedProducts");
        var searchResults = component.get("v.searchResults");
        var isProductSelected = selectedValue != "selectAll" && selectedValue != "removeAll" && selectedValue != "addProductToQLI";
        if(isProductSelected){
			var idx = Number(selectedValue.replace('record',''));
            var selectedProduct;
            searchResults.forEach(function(f,i){
                if(i == idx){
                    selectedProduct = f;
                    return;
                }
            });
            //searchResults.splice(idx,1);	//remove item from the search list 
            selectedProducts.unshift(selectedProduct);
			//component.set("v.searchResults",searchResults);
        	component.set("v.selectedProducts",selectedProducts);
            if(searchResults.length == 0){
            	component.find("lookupInput").set("v.value",'');
            }
            event.getSource().set("v.checked",false);
            return;
        }
        if(selectedValue == "selectAll"){
            selectedProducts = searchResults.concat(selectedProducts);
            //Clear the search list
			//searchResults = [];
            //component.set("v.searchResults",searchResults);
            //component.find("lookupInput").set("v.value",'');
			component.set("v.selectedProducts",selectedProducts);
			event.getSource().set("v.checked",false);

            return;
        }
        if(selectedValue == "removeAll"){
            component.set("v.selectedProducts",[]);
            return;
        }
        if(selectedValue == "addProductToQLI"){
            component.set("v.selectedProducts",[]);
            var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
            qliEditEvent.setParams({action: "AddSearchedProducts",payload:JSON.stringify(selectedProducts.reverse())});
            qliEditEvent.fire();
            component.set("v.selectedProducts",[]);
            component.set("v.searchResults",[]);
			component.find("lookupInput").set("v.value",'');
            return;
            //send selectedProducs to table
        }
    },
	importCSV: function (component, event,helper) {
        component.set("v.hideImportQLI",false);
    },
    
        
    handleItemRemove: function (component, event,helper) {
        var items = component.get("v.selectedProducts");
        //var item = event.getParam("index");
		var item = event.getSource().get("v.name");
        items.splice(item, 1);
        component.set("v.selectedProducts", items);
    }
})