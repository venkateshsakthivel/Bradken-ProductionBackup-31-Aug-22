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
        helper.setAtrributesToDefaultValue(component,event,helper);
        helper.init(component, event, helper);
        var qli = component.get("v.quoteline");
        var isImported = qli.Imported__c;
        var isNew = !(qli.Id);
        if(!isImported && isNew){
        	$A.enqueueAction(component.get('c.refreshQuoteLine'));
        }
        helper.setAtrributesToDefaultValue(component,event,helper);
         $A.enqueueAction(component.get('c.handleUpdateProductandFreightCost'));
         $A.enqueueAction(component.get('c.calculateForecastedUnitProductCost'));
	},
	handleChangedColumns : function(component, event, helper) {
		helper.init(component, event, helper);
	},
    doAction : function(component, event, helper) {
        var params = event.getParam("arguments");
        if (params) {
            if(params.action == "updatecolumns"){
				helper.init(component, event, helper);
            }
            if(params.action == "getQuoteLine"){
				return component.get("v.quoteline");
            }
            if(params.action == "getQuoteLineItemsObject"){
                var allValid = component.find('qliinputs').reduce(function (validSoFar, inputCmp) {
                    inputCmp.showHelpMessageIfInvalid();
                    return validSoFar && !inputCmp.get('v.validity').valueMissing;
                }, true);
                if (allValid) {
                    var qli = helper.setQuoteLineItemFields(component, event, helper);
                	return qli ;
                } else {
                    return null;
                }
            }
            if(params.action == "UpdateQLIFields"){
                var qliFields = JSON.parse(params.payload);
                if(!Object.entries(qliFields).length) return;


                var qli = component.get('v.quoteline');
                Object.keys(qliFields).forEach((field)=>{
                    qli[field] = qliFields[field];
                })
                component.set('v.quoteline', qli);

                var Quotelinefields = component.get("v.quotelinefields");
                Quotelinefields.forEach((field)=>{
                    if(qliFields[field.api]){
                        if(field.api == 'Supplier__c' ){
                            field.value = qliFields[field.api];
                        }
                        if(field.api == 'Despatch_Warehouse__c'){
                            field.value = qliFields[field.api];
                        } 
                    }
                });
                component.set("v.quotelinefields",Quotelinefields);
                helper.updateModalValues(component, event, helper);  

                $A.enqueueAction(component.get('c.refreshQuoteLine'));
            }
        }
        
	},
    handleDataChange :function(component, event, helper) {
        var changedFieldName = event.getSource().get("v.name");
        var changedFields = ['Quantity','Unit_Cost_Price__c','Freight_Cost_Price__c','Pattern_Cost_Price__c','UnitPrice','Freight_Sell_Price__c','Pattern_Sell_Price__c'];
        if(!changedFields.includes(changedFieldName)){
            return;
        }
		helper.recalculate(component,event,helper);
    },
    
    handleopenProductandFreightCostModal: function(component, event, helper) {
        // Set isModalOpen attribute to true
        //set modal attributes
        var qli = component.get('v.quoteline');
        component.set('v.modalProductCost', parseFloat(qli.Product_Cost__c).toFixed(2));
        //component.set('v.modalProductCost', qli.Product_Cost__c);
        //component.set('v.modalFreightCost', qli.Freight_Cost__c);
        if(qli.Unit_Freight_Cost__c) //populate default value as 0
            component.set('v.modalFreightCost', qli.Unit_Freight_Cost__c);
        component.set('v.modalLastUpdatedDate', qli.Last_Updated_Date__c);
        component.set('v.modalTotalGrossMarginPercentage', qli.Target_Gross_Margin__c);
        //component.set('v.modalOutboundFreightCost', qli.Freight_Cost_Price__c);
        //component.set('v.modalOutboundFreightSell', qli.Freight_Sell_Price__c);
        //component.set('v.modalPatternToolingCost', qli.Pattern_Cost_Price__c);
        //component.set('v.modalPatternToolingSell', qli.Pattern_Sell_Price__c);
        helper.calculateUnitCost(component, event, helper);
 
        component.set("v.isModalOpen", true);  
         
   	},
    
    handlecloseProductandFreightCostModal: function(component, event, helper) {
      // Set isModalOpen attribute to false  
      var qli = component.get('v.quoteline');

      component.set('v.modalProductCost',qli.Product_Cost__c);
      //component.set('v.modalFreightCost', qli.Freight_Cost__c);
      if(qli.Unit_Freight_Cost__c) //populate default value as 0
        component.set('v.modalFreightCost', qli.Unit_Freight_Cost__c);
      
        component.set('v.forecastedUnitProductCost', qli.Forecasted_Unit_Product_Cost__c);
      //component.set('v.modalOutboundFreightCost', qli.Freight_Cost_Price__c);
      //component.set('v.modalOutboundFreightSell', qli.Freight_Sell_Price__c);
      //component.set('v.modalPatternToolingCost', qli.Pattern_Cost_Price__c);
      //component.set('v.modalPatternToolingSell', qli.Pattern_Sell_Price__c);
      component.set('v.modalTotalGrossMarginPercentage', '');
    //   window.location.reload();
      component.set("v.isModalOpen", false);
      //component.set("v.isButtonActive",true);
   },
    
   handleProductandFreightCostChangeInModal: function(component, event, helper) {
        var productCostField = component.find('productCost');
        var productCostString = component.get('v.modalProductCost').toString();
        console.log(productCostString);

        var quantity = component.get('v.quantity');

        var quantityField = component.find('quantity');
        if(!quantity || quantity==0){
            quantityField.setCustomValidity('Quantity Cannot be Blank or Zero');
            component.set("v.isButtonActive",true);
            return;
        }
        else {
            quantityField.setCustomValidity('');
            component.set("v.isButtonActive",false); 
        }
       if(/^[0-9]*\.[0-9]{2}$/.test(productCostString)||productCostString == ""){
           productCostField.setCustomValidity('');
           productCostField.showHelpMessageIfInvalid(); 
           component.set("v.isButtonActive",false); 
       }
       else {
           productCostField.setCustomValidity('Please use following format: xxxx.xx - e.g., 5000.25');
           productCostField.showHelpMessageIfInvalid(); 
           component.set("v.isButtonActive",true); 
       }

      /*  var getQuantity = helper.getPriceValue(component,'Quantity');

       if(!getQuantity)
        {
            component.set("v.isButtonActive",true);
        }else{
            component.set("v.isButtonActive",false);
        } */
 


       //QLE Calculations for fields on popup
       var quotelineitem = component.get('v.quoteline');

       //
       var modalProductCostVar = component.get('v.modalProductCost');
       var fcUP = parseFloat(modalProductCostVar)*(parseFloat(1.00)+(parseFloat(quotelineitem.Forecasted_Cost_Increase_Percentage__c)/parseFloat(100.00))); 
       var forecastedUnitProductCost = helper.roundNumber(fcUP,2);
       component.set('v.forecastedUnitProductCost', forecastedUnitProductCost);

       //
       var totalUnitGrossPercentage = component.get("v.quoteline.Target_Gross_Margin__c");
       var unitFreightCost = component.get('v.modalFreightCost');
       var totalUnitGrossPercentageToString = totalUnitGrossPercentage.toString();
       if(  !(totalUnitGrossPercentageToString==="")) //unit price should be calculated only if gm% in entered else value should be entered manually
       {   
            //totalUnitGrossPercentage =0.0;
            var unitPrice = parseFloat(forecastedUnitProductCost)/(1-(parseFloat(totalUnitGrossPercentage)/100));
            unitPrice = helper.roundNumber(unitPrice,2);
            component.set('v.quoteline.UnitPrice',unitPrice);
       }
       /*if(totalUnitGrossPercentageToString===""){
            component.set('v.quoteline.UnitPrice','');
       }*/


      // component.set('v.unitFreightSell',(parseFloat(unitFreightCost)  + (parseFloat(unitFreightCost) * (parseFloat(quotelineitem.Unit_Freight_Markup__c)/100))));
       var calUnitFreightSell = parseFloat(unitFreightCost)  + (parseFloat(unitFreightCost) * (parseFloat(quotelineitem.Unit_Freight_Markup__c)/100));
       var unitFreightSell = helper.roundNumber(calUnitFreightSell,2);
       component.set('v.unitFreightSell', unitFreightSell);


    //    component.set('v.linePatternAndToolingSell', (parseFloat(quotelineitem.Pattern_Cost_Price__c) + (parseFloat(quotelineitem.Pattern_Cost_Price__c) * (parseFloat(quotelineitem.Line_Pattern_Tooling_Markup__c)/100))));
       var calLinePatternAndToolingCost = parseFloat(quotelineitem.Pattern_Cost_Price__c) + (parseFloat(quotelineitem.Pattern_Cost_Price__c) * (parseFloat(quotelineitem.Line_Pattern_Tooling_Markup__c)/100));
       var linePatternAndToolingSell = helper.roundNumber(calLinePatternAndToolingCost,2);
       component.set('v.linePatternAndToolingSell', linePatternAndToolingSell);


    //    component.set('v.otherSell',(parseFloat(quotelineitem.Other_Duties_Tariffs_Cost__c) + (parseFloat(quotelineitem.Other_Duties_Tariffs_Cost__c) * (parseFloat(quotelineitem.Other_Duties_Tariffs_Markup__c)/100))));
       var calOtherSell = parseFloat(quotelineitem.Other_Duties_Tariffs_Cost__c) + (parseFloat(quotelineitem.Other_Duties_Tariffs_Cost__c) * (parseFloat(quotelineitem.Other_Duties_Tariffs_Markup__c)/100));
       var otherSell = helper.roundNumber(calOtherSell,2);
       component.set('v.otherSell', otherSell);

       //onchange calculate total unit cost start
       var forecastedUnitProductCost = component.get("v.forecastedUnitProductCost");
       var unitFreightCost = component.get("v.modalFreightCost");
       var otherCost = component.get("v.quoteline.Other_Duties_Tariffs_Cost__c");
       var patternCostPrice = component.get("v.quoteline.Pattern_Cost_Price__c");
       //helper.getPriceValue(component,'Pattern_Cost_Price__c');
    //    var quantity = helper.getPriceValue(component,'Quantity');
      
       if(!forecastedUnitProductCost){
            forecastedUnitProductCost=0.0;    
       }
        var unitCostPrice = parseFloat(forecastedUnitProductCost) + parseFloat(unitFreightCost) + parseFloat(otherCost) + (parseFloat(patternCostPrice)/quantity);
        var calTotalUnitCost =  helper.roundNumber(unitCostPrice,2);
        component.set('v.unitCostPrice',calTotalUnitCost ); 
        
        //onchange calculate total unit cost end
       //total unit cost
  /* 
         var otherCost = component.get("v.quoteline.Other_Duties_Tariffs_Cost__c");
         var quantity = helper.getPriceValue(component,'Quantity');
         var patternCostPrice = helper.getPriceValue(component,'Pattern_Cost_Price__c');

       if(!forecastedUnitProductCost)
           forecastedUnitProductCost=0.0;
       var unitCostPrice = parseFloat(forecastedUnitProductCost) + parseFloat(unitFreightCost) + parseFloat(otherCost) + (parseFloat(patternCostPrice)/quantity);
       var calTotalUnitCost =  helper.roundNumber(unitCostPrice,2);
       component.set('v.unitCostPrice',calTotalUnitCost );  */


      // Set isModalOpen attribute to false 
       helper.calculateUnitCost(component, event, helper);
       
    //    var unitFreightSellFunction = component.get('c.calculateUnitFreightSell');
    //    $A.enqueueAction(unitFreightSellFunction);



   }, 
    handleDelete : function(component, event, helper) {
        var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
            qliEditEvent.setParams({action: "removeItem",payload:component.get("v.index")});
            qliEditEvent.fire();
    },
    
    handleUpdateProductandFreightCost : function(component, event, helper) {
        var modalProductCost = component.get("v.modalProductCost");
        var modalFreightCost = component.get("v.modalFreightCost");
        var unitProductGMPercent = component.get("v.unitProductGMPercent");
        var marginPct = component.get("v.marginPct");
       //02062022 - Populate QLE(i) popout
        var forecastedCostIncreasePercentage = component.get("v.quoteline.Forecasted_Cost_Increase_Percentage__c");
        console.log('fcip',forecastedCostIncreasePercentage);
        var unitFreightMarkup = component.get("v.quoteline.Unit_Freight_Markup__c");
        var linePatternAndToolingCost = component.get("v.quoteline.Pattern_Cost_Price__c");
        var linePatternAndToolingCostMarkup = component.get("v.quoteline.Line_Pattern_Tooling_Markup__c");
        var otherCost = component.get("v.quoteline.Other_Duties_Tariffs_Cost__c");
        var otherMarkup = component.get("v.quoteline.Other_Duties_Tariffs_Markup__c");
        var unitProductSell = component.get("v.quoteline.UnitPrice");
        var totalUnitGrossPercentage = component.get("v.quoteline.Target_Gross_Margin__c");
		var forecastedUnitProductCost = component.get("v.forecastedUnitProductCost");
        var unitFreightSell = component.get("v.unitFreightSell");
        var linePatternAndToolingSell = component.get("v.linePatternAndToolingSell");
        var otherSell = component.get("v.otherSell");  
        var quantity = component.get("v.quantity");
   
        
        // var modalOutboundFreightCost = component.get("v.modalOutboundFreightCost");
        //var modalOutboundFreightSell = component.get("v.modalOutboundFreightSell");
        //var modalPatternToolingCost = component.get("v.modalPatternToolingCost");
        //var modalPatternToolingSell = component.get("v.modalPatternToolingSell");
		
        var totalGrossMarginPercentage = component.get('v.modalTotalGrossMarginPercentage');
        var unitCostPrice = component.get("v.modalUnitPriceCost");

  

        var qli = component.get('v.quoteline');
        
        //update line item
        qli.Product_Cost__c = modalProductCost;
        //qli.Freight_Cost__c = modalFreightCost;
        qli.Unit_Freight_Cost__c = modalFreightCost;
        qli.Unit_Cost_Price__c = totalGrossMarginPercentage;
        //qli.Target_Gross_Margin__c = totalGrossMarginPercentage;
        //qli.UnitPrice = unitCostPrice; Unit Product Sell was getting overridden hence commenting the line.

        // qli.Freight_Cost_Price__c = modalOutboundFreightCost;  
        //qli.Freight_Sell_Price__c = modalOutboundFreightSell;
        //qli.Pattern_Cost_Price__c = modalPatternToolingCost;
        //qli.Pattern_Sell_Price__c = modalPatternToolingSell;
        qli.Freight_Sell_Price__c = unitFreightSell;
        qli.Freight_Cost_Price__c = modalFreightCost; // to bypass validation rule
        qli.Forecasted_Unit_Product_Cost__c = forecastedUnitProductCost; 
        qli.Other_Duties_Tariffs_Sell__c = otherSell;
        qli.Pattern_Sell_Price__c = linePatternAndToolingSell;
        qli.Quantity = quantity;
        
        //02062022 - Populate QLE(i) popout            
        qli.Forecasted_Cost_Increase_Percentage__c = forecastedCostIncreasePercentage;
     
        component.set('v.quoteline', qli);

        var Quotelinefields = component.get("v.quotelinefields");
        Quotelinefields.forEach(function(field){
            if(field.api == 'UnitPrice' && !isNaN(totalGrossMarginPercentage) && totalGrossMarginPercentage!=null && totalGrossMarginPercentage!=''){
                var num = parseFloat(unitCostPrice) / (1 - (parseFloat(totalGrossMarginPercentage) / 100));
                field.value = helper.roundNumber(num,2);
            }
            else if(field.api == 'Unit_Cost_Price__c' /*&& !isNaN(unitCostPrice) && unitCostPrice!=null && unitCostPrice!=''*/){
                field.value = parseFloat(unitCostPrice);
            }
            if(field.api == 'Forecasted_Cost_Increase_Percentage__c'){
                field.value = forecastedCostIncreasePercentage;
            }
            if(field.api == 'Unit_Freight_Markup__c'){
                field.value = unitFreightMarkup;
            }
            if(field.api == 'Pattern_Cost_Price__c'){
                field.value = linePatternAndToolingCost;
            }
            if(field.api == 'Line_Pattern_Tooling_Markup__c'){
                field.value = linePatternAndToolingCostMarkup;
            }
            if(field.api == 'Other_Duties_Tariffs_Cost__c'){
                field.value = otherCost;
            }
            if(field.api == 'Other_Duties_Tariffs_Markup__c'){
                field.value = otherMarkup;
            }
            if(field.api == 'UnitPrice'){
                field.value = unitProductSell;
            }
            if(field.api == 'Target_Gross_Margin__c'){
                field.value = totalUnitGrossPercentage;
            } 
            if(field.api == 'Forecasted_Unit_Product_Cost__c'){
                field.value = forecastedUnitProductCost;
            }
            if(field.api == 'Pattern_Sell_Price__c'){
                field.value = linePatternAndToolingSell;
            }
            if(field.api == 'Other_Duties_Tariffs_Sell__c'){
                field.value = otherSell;
            }
            if(field.api == 'Freight_Sell_Price__c'){
                field.value = unitFreightSell;
            }
            if(field.api == 'TotalUnitCostPrice__c'){
                field.value = parseFloat(unitCostPrice);
            }
            if(field.api == 'Unit_Freight_Cost__c'){
                field.value = modalFreightCost;
            }
            if(field.api == 'Product_Cost__c'){
                field.value = parseFloat(modalProductCost);
            }
            if(field.api == 'Unit_Product_Margin_Percentage__c'){
                    field.value = parseFloat(unitProductGMPercent);   
            }
            if(field.api == 'Margin_Percent__c'){
                field.value = parseFloat(marginPct);   
            }
            if(field.api == 'Quantity'){
                field.value = quantity;   
            }   
            
            

                     
        });
        
        component.set('v.modalTotalGrossMarginPercentage', '');
        component.set("v.quotelinefields",Quotelinefields);
        component.set("v.isModalOpen", false);
        helper.recalculate(component, event, helper); 
        
    },
        
    handleWarehouseUpdate:function(component, event, helper){
        var args = event.getParam("arguments");
        var qli = component.get('v.quoteline');
        qli.Supplier__c = args.supplier;
        qli.Despatch_Warehouse__c = args.warehouse.Id;
        component.set('v.quoteline', qli);
        var Quotelinefields = component.get("v.quotelinefields");
        Quotelinefields.forEach(function(field){
            if(field.api == 'Supplier__c'){
                field.value = args.supplier;
            }
            else if(field.api == 'Despatch_Warehouse__c'){
                field.value = args.warehouse.Id;
            } 
        });
        
         component.set("v.quotelinefields",Quotelinefields);
       
    },

    handleNoConfirm:function(component, event, helper){
        component.set('v.isConfirmModalOpen',false);
        component.set('v.modalAction','');
    },

    handleYesConfirm:function(component, event, helper){
        component.set('v.isConfirmModalOpen',false);
        var action = component.get('v.modalAction');
        component.set('v.modalAction','');
        $A.enqueueAction(component.get('c.'+action));
    },
    
    showRecalculateModal:function(component, event, helper){
        component.set('v.isConfirmModalOpen',true);
        component.set('v.modalAction','refreshQuoteLine');
    },

    showDeleteModal:function(component, event, helper){
        component.set('v.isConfirmModalOpen',true);
        component.set('v.modalAction','handleDelete');
    },
    
    refreshQuoteLine:function(component, event, helper){
        component.set('v.Spinner',true);
        var qli = helper.setQuoteLineItemFields(component, event, helper);
        qli.Supplier__c = helper.getFieldValue(component,'Supplier__c');
        var action = component.get('c.calculateProductAndFreightCosts');

        var qliList = [];
        qliList.push(qli);
        
        action.setParams({
            quoteLineItems : qliList
        });
        action.setCallback(this, function(response){
            component.set('v.Spinner',false);
            var state = response.getState();
            if(state === 'SUCCESS'){
                var qliReturned = response.getReturnValue()[0];
                qliReturned.Total_Margin_Percent__c = qliReturned.Total_Margin_Percent__c /100;
				var lastUpdatedDate = (qliReturned.Last_Updated_Date__c) ? qliReturned.Last_Updated_Date__c : '';
                var curQLI = component.get('v.quoteline');
                curQLI = Object.assign(curQLI,qliReturned);
                curQLI.Last_Updated_Date__c = lastUpdatedDate;
                component.set('v.quoteline', curQLI);
                component.set('v.modalProductCost', qliReturned.Product_Cost__c);
                //component.set('v.modalFreightCost', qliReturned.Freight_Cost__c);
                component.set('v.modalFreightCost', qliReturned.Unit_Freight_Cost__c);
                //component.set('v.modalOutboundFreightCost', qliReturned.Freight_Cost_Price__c);
      			//component.set('v.modalOutboundFreightSell', qliReturned.Freight_Sell_Price__c);
      			//component.set('v.modalPatternToolingCost', qliReturned.Pattern_Cost_Price__c);
      			//component.set('v.modalPatternToolingSell', qliReturned.Pattern_Sell_Price__c);
                component.set('v.modalLastUpdatedDate',lastUpdatedDate);
                component.set('v.modalTotalGrossMarginPercentage', qliReturned.Target_Gross_Margin__c);
                helper.calculateUnitCost(component, event, helper);
                component.set('v.Spinner',false);
                $A.enqueueAction(component.get('c.handleUpdateProductandFreightCost'));
                $A.enqueueAction(component.get('c.calculateForecastedUnitProductCost'));

            }
            else{
                var errors = response.getError();
                console.log(errors);
            }
        });
        $A.enqueueAction(action);
    },
    
    updateModalAttributes:function(component, event, helper){
        component.set('v.modalProductCost', qli.Product_Cost__c);
        //component.set('v.modalFreightCost', qli.Freight_Cost__c);
        component.set('v.modalFreightCost', qli.Unit_Freight_Cost__c);
        //component.set('v.modalOutboundFreightCost', qli.Freight_Cost_Price__c);
        //component.set('v.modalOutboundFreightSell', qli.Freight_Sell_Price__c);
        //component.set('v.modalPatternToolingCost', qli.Pattern_Cost_Price__c);
        //component.set('v.modalPatternToolingSell', qli.Pattern_Sell_Price__c);
        component.set('v.modalTotalGrossMarginPercentage', qli.Target_Gross_Margin__c);
    },
    
    updateProductAndFreightCosts: function(component, event, helper) {        
        var args = event.getParam("arguments");
        var qli = component.get('v.quoteline');
        qli.Product_Cost__c = args.productCost;
        qli.Freight_Cost__c = args.freightCost;
        qli.Freight_Cost_Price__c = args.freightOutboundCost;
        qli.Freight_Sell_Price__c = args.freightOutboundSell;
        //qli.Pattern_Cost_Price__c = args.patternToolingCost;
        //qli.Pattern_Sell_Price__c = args.patternSellCost;
        qli.Last_Updated_Date__c = args.lastUpdatedDate;
        //qli.Freight_Cost__c = args.warehouse.Id;
        qli.Product_Cost_Rate__c = args.productCostRate;
        qli.Freight_Cost_Rate__c = args.freightCostRate;
        component.set('v.quoteline',qli);
        component.set('v.modalProductCost', component.get('v.quoteline').Product_Cost__c);
        //component.set('v.modalFreightCost', component.get('v.quoteline').Freight_Cost__c);
        component.set('v.modalFreightCost', component.get('v.quoteline').Unit_Freight_Cost__c);
		component.set('v.modalOutboundFreightCost', component.get('v.quoteline').Freight_Cost_Price__c);
      	component.set('v.modalOutboundFreightSell', component.get('v.quoteline').Freight_Sell_Price__c);
      	//component.set('v.modalPatternToolingCost', component.get('v.quoteline').Pattern_Cost_Price__c);
      	//component.set('v.modalPatternToolingSell', component.get('v.quoteline').Pattern_Sell_Price__c);
        component.set('v.modalLastUpdatedDate', component.get('v.quoteline').Last_Updated_Date__c);
        $A.enqueueAction(component.get('c.refreshQuoteLine'));

    },
    
    doAllQLECalculations: function(component, event, helper){
        var quotelineitem = component.get('v.quoteline');
        component.set('v.forecastedUnitProductCost',(quotelineitem.Product_Cost__c*(1+(quotelineitem.Forecasted_Cost_Increase_Percentage__c/100))));
        var unitFreightCost = component.get('v.modalFreightCost')
        component.set('v.unitFreightSell',(unitFreightCost  + (unitFreightCost * (quotelineitem.Unit_Freight_Markup__c/100))));
        component.set('v.linePatternAndToolingSell', (quotelineitem.Pattern_Cost_Price__c + (quotelineitem.Pattern_Cost_Price__c * (quotelineitem.Line_Pattern_Tooling_Markup__c/100))));
        component.set('v.otherSell',(quotelineitem.Other_Duties_Tariffs_Cost__c + (quotelineitem.Other_Duties_Tariffs_Cost__c * (quotelineitem.Other_Duties_Tariffs_Markup__c/100))));
        
    },

	calculateForecastedUnitProductCost: function(component, event, helper){
        var quotelineitem = component.get('v.quoteline');
        component.set('v.forecastedUnitProductCost',(quotelineitem.Product_Cost__c*(1+(quotelineitem.Forecasted_Cost_Increase_Percentage__c/100))));
		component.set("v.isButtonActive",false);                         
	},
                    
	calculateUnitFreightSell: function(component, event, helper){  
        var quotelineitem = component.get('v.quoteline'); 
        var unitFreightCost = component.get('v.modalFreightCost')
        component.set('v.unitFreightSell',(unitFreightCost  + (unitFreightCost * (quotelineitem.Unit_Freight_Markup__c/100))));
	}, 
     
    //04062022 - QLE Calculations
    calculateLinePatternAndToolingSell: function(component, event, helper){
        var quotelineitem = component.get('v.quoteline');
        component.set('v.linePatternAndToolingSell', (quotelineitem.Pattern_Cost_Price__c + (quotelineitem.Pattern_Cost_Price__c * (quotelineitem.Line_Pattern_Tooling_Markup__c/100))));
    },

    calculateOtherSell: function(component, event, helper){
        var quotelineitem = component.get('v.quoteline');
        component.set('v.otherSell',(quotelineitem.Other_Duties_Tariffs_Cost__c + (quotelineitem.Other_Duties_Tariffs_Cost__c * (quotelineitem.Other_Duties_Tariffs_Markup__c/100))));
    },

    calculateTotalUnitSellPriceHelperCall: function(component,event,helper){
        helper.calculateTotalUnitSellPrice(component,event,helper);
        component.set("v.isButtonActive",false);
    },

    //New Dummy UI start
    showNewUIDummyModal: function(component, event, helper){
        component.set("v.ifShowNewUIDummyModal",true);
    },

    closeNewUIDummyModal: function(component, event, helper){
        component.set("v.ifShowNewUIDummyModal",false);
    },
    //New Dummy UI end



    
})