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
    init : function(component, event, helper) {
        //console.log(":FC:AK:I am in QuoteLineRow:Init");
        var quoteline = component.get("v.quoteline");
        var quoteLineFieldDescribe = component.get("v.quoteLineFieldDescribe");
        var oldQuotelinefields = component.get("v.quotelinefields");
		var quotelinefields = [];
        var quoteLineEditorConfig = component.get("v.quoteLineEditorConfig");
        quoteLineEditorConfig.filter(function(c,i){
           // console.log(":FC:AK:I am in QuoteLineRow:Init:quoteLineEditorConfig");
            var qf = c.FieldAPI__c;
            var qli = {};
            var oldQli = oldQuotelinefields[i];
            qli["api"] = qf;
            qli["value"] = oldQli ? oldQli.value : quoteline[qf];
            //Default values
            if(!quoteline.Id && !qli.value){
                console.log(":FC:AK:I am in QuoteLineRow:Init:quoteLineEditorConfig:No QL Id and QLI value");
                if(qf == 'Bradken_Description__c'){
                    qli["value"] = quoteline.PricebookEntryIdValues.Product2.Description;
                }
                //:FC:AK:16-05-22:Commenting below for testing. Below line is causing QLE error, products are not added
                
                if(qf == 'IsProductInactive__c'){
                    qli["value"] = !quoteline.PricebookEntryIdValues.Product2.IsActive;
                    console.log(':FC:AK:- Product Status:' + quoteline.PricebookEntryIdValues.Product2.IsActive);
                    
                }
                
                
                if(qf == 'UnitPrice'){
                    qli["value"] = quoteline.PricebookEntryIdValues.UnitPrice;
                }
                if(qf == 'Customer_Part_Description__c'){
                    qli["value"] = quoteline.customerProduct.Customer_Product_Description__c;
                }
                if(qf == 'Customer_Part_Number__c'){
                    qli["value"] = quoteline.customerProduct.Name;
                }
                if(qf == 'Lead_Time__c'){
                    qli["value"] = quoteline.PricebookEntryIdValues.Product2.Lead_Time__c;
                }
                if(qf == 'Drawing_Number__c'){
                    qli["value"] = quoteline.PricebookEntryIdValues.Product2.Drawing_Number__c;
                }
                if(qf == 'Drawing_Number_Revision__c'){
                    qli["value"] = quoteline.PricebookEntryIdValues.Product2.Drawing_Number_Revision__c;
                }
                if(qf == 'Material_Grade__c'){
                    qli["value"] = quoteline.PricebookEntryIdValues.Product2.Material_Grade__c;
                }
                if(qf == 'UoM__c'){
                    qli["value"] = quoteline.PricebookEntryIdValues.Product2.UoM__c;
                }
                if(qf == 'Weight__c'){
                    qli["value"] = quoteline.PricebookEntryIdValues.Product2.Weight__c;
                }
                if(qf == 'Line_Item_Sell_Price__c'){
                    qli["value"] = quoteline.Line_Item_Sell_Price__c;
                }
                if(qf == 'Total_Margin_Amount__c'){
                    qli["value"] = quoteline.Total_Margin_Amount__c;
                }
                if(qf == 'Total_Margin_Percent__c'){
                    qli["value"] = quoteline.Total_Margin_Percent__c;
                }
                if(qf == 'Margin_Amount__c'){
                    qli["value"] = quoteline.Margin_Amount__c;
                }
                if(qf == 'Margin_Percent__c'){
                    qli["value"] = quoteline.Margin_Percent__c;
                }
                
                 if(qf == 'Product_Cost__c'){
                    qli["value"] = quoteline.Product_Cost__c;
                }  
                
                if(qf == 'Freight_Cost__c'){
                    qli["value"] = quoteline.Freight_Cost__c;
                }
                
                if (qf == 'Unit_Freight_Cost__c'){
                    qli["value"] = quoteline.Unit_Freight_Cost__c;
                }
                
                if(qf == 'Last_Updated_Date__c'){
                    qli["value"] = quoteline.Last_Updated_Date__c;
                }
                
                if(qf == 'Supplier__c'){
                    qli["value"] = quoteline.Supplier__c;
                }
                if(qf == 'Forecasted_Cost_Increase_Percentage__c'){
                    qli["value"] = quoteline.Forecasted_Cost_Increase_Percentage__c;
                }
                if(qf == 'Unit_Freight_Markup__c'){
                    qli["value"] = quoteline.Unit_Freight_Markup__c;
                }
                if(qf == 'Pattern_Cost_Price__c'){
                    qli["value"] = quoteline.Pattern_Cost_Price__c;
                }
                if(qf == 'Line_Pattern_Tooling_Markup__c'){
                    qli["value"] = quoteline.Line_Pattern_Tooling_Markup__c;
                }
                if(qf == 'Other_Duties_Tariffs_Cost__c'){
                    qli["value"] = quoteline.Other_Duties_Tariffs_Cost__c;
                }
                if(qf == 'Other_Duties_Tariffs_Markup__c'){
                    qli["value"] = quoteline.Other_Duties_Tariffs_Markup__c;
                }
                if(qf == 'Last_Sold_Unit_Price__c'){
                    if(quoteline.OrderItem){
                        qli["value"] = quoteline.OrderItem.UnitPrice;
                    }    
                }
                if(qf == 'Last_Sold_Date__c'){
                    if(quoteline.OrderItem){
                        qli["value"] = quoteline.OrderItem.Invoiced_Date__c;
                    }    
                }
                if(qf == 'Last_Sold_GM_Percentage__c'){
                    if(quoteline.OrderItem){
                        qli["value"] = quoteline.OrderItem.Gross_Margin__c;
                    }      
                }
               /*  if(qf == 'UnitPrice'){
                    qli["value"] = quoteline.UnitPrice;
                } */
                if(qf == 'Target_Gross_Margin__c'){
                    qli["value"] = quoteline.Target_Gross_Margin__c;
                }
                if(qf == 'Forecasted_Unit_Product_Cost__c'){
                    qli["value"] = quoteline.Forecasted_Unit_Product_Cost__c;
                }
                if(qf == 'Freight_Sell_Price__c'){
                    qli["value"] = quoteline.Freight_Sell_Price__c;
                }
                if(qf == 'Pattern_Sell_Price__c'){
                    qli["value"] = quoteline.Pattern_Sell_Price__c;
                }
                if(qf == 'Other_Duties_Tariffs_Sell__c'){
                    qli["value"] = quoteline.Other_Duties_Tariffs_Sell__c;
                }
              
               
                

                /*if(qf == 'Bradken_Part_Number__c'){
                    qli["value"] = quoteline.Bradken_Part_Number__c;
                }*/
            } else{
            
            //:FC:AK:16-05-22:Commenting below for testing. Below line is causing QLE error, products are not added
                
                if(qf == 'IsProductInactive__c'){
                    qli["value"] = !quoteline.Product2.IsActive;
                    console.log(':FC:AK:- Product Status:' + quoteline.Product2.IsActive);
                    
                }
            }
            
            qli["props"]  = quoteLineFieldDescribe.filter(function(qd){
                if(qd.name == qf){return qd;}
            })[0]; 
            qli["selected"] = false;
            if(c.Display__c == 'Required'){
                qli["selected"] = true;
            }else{
                /*qli["selected"] = selectedColumns.filter(function(sc){
                    if(sc.FieldAPI__c == qf){return sc.DefaultChecked__c ;}
                })[0];*/
                qli["selected"] = c.DefaultChecked__c;
            }
            qli["config"] = c;
            try{
                qli['readonly']= false;
               
                if(c.Editable_After_Status__c && quoteline.Quote && !c.Editable_After_Status__c.includes(quoteline.Quote.Status)){
                    qli['readonly']= true; 
                } 
                if(c.Display__c == 'Readonly'){
                	qli["readonly"] = true;
            	}
            }catch(e){
                debugger;
            }
            quotelinefields.push(qli);
            
        });
        
        helper.updateModalValues(component, event, helper);  
        quotelinefields.sort(helper.sortObject("config.SortOrder__c"));
        component.set("v.quotelinefields",quotelinefields);
        helper.setAtrributesToDefaultValue(component,event,helper);
		helper.recalculate(component,event,helper);
        
    },
    updateModalValues:function(component, event, helper){
       // console.log(":FC:AK:I am in QuoteLineRow:updateModalValues");
        component.set('v.modalProductCost', component.get('v.quoteline').Product_Cost__c);
        //component.set('v.modalFreightCost', component.get('v.quoteline').Freight_Cost__c);
        component.set('v.modalFreightCost', component.get('v.quoteline').Unit_Freight_Cost__c);
        component.set('v.modalTotalGrossMarginPercentage', component.get('v.quoteline').Target_Gross_Margin__c);
        //Product Cost Decimal Places in QLE user story changes
        component.set('v.forecastedUnitProductCost', component.get('v.quoteline').Forecasted_Unit_Product_Cost__c);
        component.set('v.unitFreightSell', component.get('v.quoteline').Freight_Sell_Price__c);
        component.set('v.linePatternAndToolingSell', component.get('v.quoteline').Pattern_Sell_Price__c);
        component.set('v.otherSell', component.get('v.quoteline').Other_Duties_Tariffs_Sell__c);

        //:FC:AK:16-05-22:Setting the product status value :
        //component.set('v.IsProductInactive__c', component.get('v.quoteline').Product2.IsActive);
        //console.log(':FC:AK:- Product Status:' + component.get('v.quoteline').Product2.IsActive);
                    
               
        
        //:FC:AK:16-05-22:Commenting below due to Aura error : 
        //component.set('v.modallastUpdatedDate', component.get('v.quoteline').Last_Updated_Date__c);
        
		//component.set('v.modalOutboundFreightCost', component.get('v.quoteline').Freight_Cost_Price__c);
      	//component.set('v.modalOutboundFreightSell', component.get('v.quoteline').Freight_Sell_Price__c);
      	//component.set('v.modalPatternToolingCost', component.get('v.quoteline').Pattern_Cost_Price__c);
      	//component.set('v.modalPatternToolingSell', component.get('v.quoteline').Pattern_Sell_Price__c);
        var num = component.get('v.quoteline').Product_Cost__c + component.get('v.quoteline').Target_Gross_Margin__c;
        component.set('v.modalUnitPriceCost',helper.roundNumber(num,2)); 

        
    },
    setQuoteLineItemFields : function(component, event, helper) {
        //console.log(":FC:AK:I am in QuoteLineRow:SetQuoteLineItemFields");
        var quoteline = component.get("v.quoteline");
        if(!quoteline) return ;
        var quoteLineItemsObject = component.get("v.quoteLineItemsObject"); //sObject
        var quotelinefields = component.get("v.quotelinefields");
        quoteLineItemsObject.Id = quoteline.Id;
        quoteLineItemsObject.QuoteId = quoteline.QuoteId;
		quotelinefields.forEach(function(qli){
            if(qli.props){ //04062022 LastSoldDateUserStory added if condition
                if(qli.props.type == 'currency'){
                    qli.value = Number(qli.value); //BSI-367 Fix for multicurrency(euro)
               }
               quoteLineItemsObject[qli.api] = qli.value;
            }
            
            
        });
        
        quoteLineItemsObject.Line_Item_Sell_Price__c = quoteline.Line_Item_Sell_Price__c;
        quoteLineItemsObject.Total_Margin_Amount__c = quoteline.Total_Margin_Amount__c;
        quoteLineItemsObject.Total_Margin_Percent__c = quoteline.Total_Margin_Percent__c *100;
        quoteLineItemsObject.Margin_Amount__c = quoteline.Margin_Amount__c;
        quoteLineItemsObject.Margin_Percent__c = quoteline.Margin_Percent__c *100;
        quoteLineItemsObject.PricebookEntryId = quoteline.PricebookEntryId;
        quoteLineItemsObject.TotalUnitCostPrice__c = quoteline.TotalUnitCostPrice__c;
        quoteLineItemsObject.TotalUnitSellPrice__c = quoteline.TotalUnitSellPrice__c;
        quoteLineItemsObject.Line_Item_Cost_Price__c = quoteline.Line_Item_Cost_Price__c;
        quoteLineItemsObject.Product_Cost__c = quoteline.Product_Cost__c;
        quoteLineItemsObject.Freight_Cost__c = quoteline.Freight_Cost__c;
        quoteLineItemsObject.Unit_Freight_Cost__c = quoteline.Unit_Freight_Cost__c;
        quoteLineItemsObject.Unit_Freight_Margin_Amount__c = quoteline.Unit_Freight_Margin_Amount__c;
        quoteLineItemsObject.Other_Duties_Tariffs_Margin_Amount__c = quoteline.Other_Duties_Tariffs_Margin_Amount__c;

        /* temp changes start
        //02062022 - Populate QLE(i) popout
        //quoteLineItemsObject.Forecasted_Cost_Increase_Percentage__c = parseFloat(quoteline.Forecasted_Cost_Increase_Percentage__c);
        quoteLineItemsObject.Unit_Freight_Markup__c = quoteline.Unit_Freight_Markup__c;
        quoteLineItemsObject.Pattern_Cost_Price__c = quoteline.Pattern_Cost_Price__c;
        quoteLineItemsObject.Line_Pattern_Tooling_Markup__c = quoteline.Line_Pattern_Tooling_Markup__c;
        quoteLineItemsObject.Other_Duties_Tariffs_Cost__c = quoteline.Other_Duties_Tariffs_Cost__c;
        quoteLineItemsObject.Other_Duties_Tariffs_Markup__c = quoteline.Other_Duties_Tariffs_Markup__c;
        quoteLineItemsObject.UnitPrice = quoteline.UnitPrice;
        quoteLineItemsObject.Target_Gross_Margin__c = quoteline.Target_Gross_Margin__c;
        temp changes end*/

        //02062022 - Last Sold Field Save
        //quoteLineItemsObject.Last_Sold_Unit_Price__c = quoteline.OrderItem.Last_Sold_Unit_Price__c;
        //quoteLineItemsObject.Last_Sold_GM_Percentage__c = quoteline.OrderItem.Last_Sold_GM_Percentage__c;
        //quoteLineItemsObject.Last_Sold_Date__c =  quoteline.OrderItem.Last_Sold_Date__c;
        //04062022 LastSoldDateUserStory start
        if(quoteline.OrderItem){
            quoteLineItemsObject.Last_Sold_Date__c =  quoteline.OrderItem.Invoiced_Date__c;
            quoteLineItemsObject.Last_Sold_Unit_Price__c = quoteline.OrderItem.LineOrderAmount__c;
            quoteLineItemsObject.Last_Sold_GM_Percentage__c = quoteline.OrderItem.Gross_Margin__c;

        }
        //04062022 LastSoldDateUserStory end

        // quoteLineItemsObject.Last_Sold_Unit_Price__c = quoteline.Last_Sold_Unit_Price__c;
        // quoteLineItemsObject.Last_Sold_GM_Percentage__c = quoteline.Last_Sold_GM_Percentage__c;
        // quoteLineItemsObject.Last_Sold_Date__c =  quoteline.Last_Sold_Date__c;

        // quoteLineItemsObject.Last_Sold_Unit_Price__c = quoteline.OrderItem.UnitPrice;
        // quoteLineItemsObject.OrderItem = quoteline.OrderItem;
        // quoteLineItemsObject.OrderItem.UnitPrice = quoteline.OrderItem.UnitPrice;
       
        quoteLineItemsObject.Freight_Cost_Price__c = quoteline.Freight_Cost_Price__c;
        //quoteLineItemsObject.Freight_Sell_Price__c = quoteline.Freight_Sell_Price__c;
        //quoteLineItemsObject.Pattern_Cost_Price__c = quoteline.Pattern_Cost_Price__c;
        //quoteLineItemsObject.Pattern_Sell_Price__c = quoteline.Pattern_Sell_Price__c;

        /* temp changes start
        //0306022 - QLE calculations
        quoteLineItemsObject.Forecasted_Unit_Product_Cost__c = quoteline.Forecasted_Unit_Product_Cost__c;
		quoteLineItemsObject.Freight_Sell_Price__c = quoteline.Freight_Sell_Price__c;
        quoteLineItemsObject.Pattern_Sell_Price__c = quoteline.Pattern_Sell_Price__c;
        quoteLineItemsObject.Other_Duties_Tariffs_Sell__c = quoteline.Other_Duties_Tariffs_Sell__c;
        quoteLineItemsObject.Other_Duties_Tariffs_Cost__c = quoteline.Other_Duties_Tariffs_Cost__c;
        quoteLineItemsObject.Other_Duties_Tariffs_Margin_Amount__c = quoteline.Other_Duties_Tariffs_Margin_Amount__c;
        quoteLineItemsObject.Other_Duties_Tariffs_Margin_Percentage__c = quoteline.Other_Duties_Tariffs_Margin_Percentage__c;
        quoteLineItemsObject.Unit_Freight_Margin_Amount__c = quoteline.Unit_Freight_Margin_Amount__c;
        quoteLineItemsObject.Unit_Freight_Margin_Percentage__c = quoteline.Unit_Freight_Margin_Percentage__c;
        temp changes end*/
        quoteLineItemsObject.Other_Duties_Tariffs_Margin_Percentage__c = quoteline.Other_Duties_Tariffs_Margin_Percentage__c;
        quoteLineItemsObject.Unit_Freight_Margin_Percentage__c = quoteline.Unit_Freight_Margin_Percentage__c;
        
        quoteLineItemsObject.Unit_Product_Margin_Percentage__c = quoteline.Unit_Product_Margin_Percentage__c;
        //quoteLineItemsObject.Margin_Percent__c = quoteline.Margin_Percent__c;
        quoteLineItemsObject.Unit_Product_Margin_Amount__c = parseFloat(quoteline.UnitPrice) - parseFloat(component.get("v.forecastedUnitProductCost"));


        quoteLineItemsObject.Last_Updated_Date__c = quoteline.Last_Updated_Date__c;
        quoteLineItemsObject.Product2Id = quoteline.Product2Id;
        if(quoteline.Supplier__c == null || quoteline.Supplier__c == ''){
            quoteLineItemsObject.Supplier__c = helper.getFieldValue(component, 'Supplier__c');
        }
        else{
            quoteLineItemsObject.Supplier__c = quoteline.Supplier__c;
        }
        quoteLineItemsObject.Despatch_Warehouse__c = (typeof quoteline.Despatch_Warehouse__c == "string") ? quoteline.Despatch_Warehouse__c : null;
        quoteLineItemsObject.Product_Cost_Rate__c = quoteline.Product_Cost_Rate__c;
        quoteLineItemsObject.Freight_Cost_Rate__c = quoteline.Freight_Cost_Rate__c;
             
        component.set("v.quoteLineItemsObject",quoteLineItemsObject);
        return quoteLineItemsObject;
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
    getPriceValue: function(component,api){
        var quotelinefields = component.get("v.quotelinefields");
        var ret = 0;
        quotelinefields.forEach(function(qf){
            if(qf){
                if(qf.api == api){
					ret = qf.value ? Number(qf.value) : 0;
                }
            }
        });
        return Number(ret);
    },
    recalculate:function(component,event,helper){
        var quotelineItem = component.get('v.quoteline');
        var quantity = helper.getPriceValue(component,'Quantity');

        
        var productCostPrice = helper.getPriceValue(component,'Unit_Cost_Price__c');
        var freightCostPrice = helper.getPriceValue(component,'Freight_Cost_Price__c');
        var patternCostPrice = helper.getPriceValue(component,'Pattern_Cost_Price__c');
        
        var productSellPrice = helper.getPriceValue(component,'UnitPrice');
        var freightSellPrice = helper.getPriceValue(component,'Freight_Sell_Price__c');
        var patternSellPrice = helper.getPriceValue(component,'Pattern_Sell_Price__c');

        var unitProductGMPercent = component.get("v.unitProductGMPercent");

        var supplier = helper.getFieldValue(component, 'Supplier__c');
        
        // var unitCostPrice = productCostPrice + freightCostPrice + (patternCostPrice/quantity);
        // var unitSellPrice = productSellPrice + freightSellPrice + (patternSellPrice/quantity);
		

        /* 04062022 - QLE Calculations - start */
        var unitProductSell = component.get("v.quoteline.UnitPrice");
        var forecastedUnitProductCost = component.get("v.forecastedUnitProductCost");

        //total unit margin
        // var marginAmt = parseFloat(unitProductSell) - parseFloat(forecastedUnitProductCost);
        // var marginAmt = unitSellPrice - unitCostPrice;


        //Other (Duties & Tarrifs) Margin $
        var otherMarginAmount = component.get("v.quoteline.Other_Duties_Tariffs_Margin_Amount__c");
        var otherSell = component.get("v.quoteline.Other_Duties_Tariffs_Sell__c");
        var otherCost = component.get("v.quoteline.Other_Duties_Tariffs_Cost__c");

        otherMarginAmount = otherSell - otherCost;


        //Other (Duties & Tarrifs) Margin %
        var otherMarginPercentage = component.get("v.quoteline.Other_Duties_Tariffs_Margin_Percentage__c");

        otherMarginPercentage =   parseFloat(otherMarginAmount) / parseFloat(otherSell);

        //TotalUnitCostPrice__c calculation
          var unitFreightCost = component.get("v.modalFreightCost");

        if(!forecastedUnitProductCost)
            forecastedUnitProductCost=0.0;
        var unitCostPrice = parseFloat(forecastedUnitProductCost) + parseFloat(unitFreightCost) + parseFloat(otherCost) + (parseFloat(patternCostPrice)/quantity);
        var calTotalUnitCost =  helper.roundNumber(unitCostPrice,2);
        component.set('v.unitCostPrice',calTotalUnitCost );

        var unitCostPrice = component.get('v.unitCostPrice');

 
        //Unit Freight Margin $
        
        var unitFreightMarginAmount = component.get("v.quoteline.Unit_Freight_Margin_Amount__c");

        unitFreightMarginAmount = freightSellPrice - unitFreightCost;

        //Unit Freight Margin %

         var unitFreightMarginPercentage = component.get("v.quoteline.Unit_Freight_Margin_Percentage__c");

         unitFreightMarginPercentage = unitFreightMarginAmount / freightSellPrice;


        //TotalUnitSellPrice__c calculation
        var unitSellPrice = parseFloat(unitProductSell) + parseFloat(freightSellPrice) + parseFloat(otherSell) + (parseFloat(patternSellPrice)/parseFloat(quantity));
        component.set('v.unitSellPrice',unitSellPrice );


        //total unit margin - 17062022 //TotalUnitSellPrice__c - TotalUnitCostPrice__c
        var marginAmt = parseFloat(unitSellPrice) - parseFloat(unitCostPrice);


        //Total_Margin_Amount__c calculation
        console.log('Unit Sell Price: '+unitSellPrice);
        console.log('Unit Cost Price: '+unitCostPrice);
        console.log('Quantity '+quantity);
        var totalMarginAmt = (parseFloat(unitSellPrice)*parseFloat(quantity)) - (parseFloat(unitCostPrice)*parseFloat(quantity));
        var calTotalMarginAmt = helper.roundNumber(totalMarginAmt,0);
        console.log('Total Margin Amt: '+calTotalMarginAmt);
        component.set('v.totalMarginAmt',calTotalMarginAmt );



        
        /* 04062022 - QLE Calculations - end */

		//var marginPct = marginAmt / unitSellPrice;
        
        var totalCostPrice = parseFloat(unitCostPrice) * quantity;
        var totalSellPrice = parseFloat(unitSellPrice) * quantity;
        
        // var totalMarginAmt = totalSellPrice - totalCostPrice;


        var totalMarginPct = totalMarginAmt / (parseFloat(unitSellPrice)*parseFloat(quantity));


        var quoteline = component.get("v.quoteline");

        //QLE-Calculations

        quoteline.Unit_Freight_Margin_Amount__c = unitFreightMarginAmount;
        //quoteline.Unit_Freight_Margin_Percentage__c = unitFreightMarginPercentage;
        quoteline.Unit_Freight_Margin_Percentage__c = helper.roundNumber(unitFreightMarginPercentage,2)*100;
        quoteline.Other_Duties_Tariffs_Margin_Amount__c = otherMarginAmount;
        //quoteline.Other_Duties_Tariffs_Margin_Percentage__c = otherMarginPercentage;
        quoteline.Other_Duties_Tariffs_Margin_Percentage__c = helper.roundNumber(otherMarginPercentage,2)*100;


        // quoteline.Unit_Product_Margin_Percentage__c = helper.roundNumber(unitProductGMPercent,2)*100;
        quoteline.Unit_Product_Margin_Percentage__c =  helper.roundNumber(parseFloat(unitProductGMPercent),2);
       

        quoteline.Margin_Amount__c = marginAmt;
        

        helper.calculateTotalUnitGMPercentage(component,event,helper);
        var marginPct = component.get("v.marginPct");
        quoteline.Margin_Percent__c = marginPct/100;

        quoteline.Supplier__c = supplier;

        quoteline.Total_Margin_Amount__c = totalMarginAmt;
        quoteline.Total_Margin_Percent__c = totalMarginPct;

        quoteline.TotalUnitCostPrice__c = parseFloat(unitCostPrice);
        quoteline.TotalUnitSellPrice__c = parseFloat(unitSellPrice);
        
        quoteline.Line_Item_Cost_Price__c = totalCostPrice;
        quoteline.Line_Item_Sell_Price__c = totalSellPrice;
        
		
        component.set("v.quoteline",quoteline);
        component.set("v.quantity",quantity );
        /* //recalculate quote Total
        var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
            qliEditEvent.setParams({action: "recalculateTotal",payload:component.get("v.index")});
            qliEditEvent.fire();*/
    },
    roundNumber:function(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    },
    getFieldValue:function(component, api){
        var val;
        var qliInputs = component.get('v.quotelinefields');
        qliInputs.forEach(function(qli){
            if(qli){
                if(qli.api == api){
                    val = qli.value;
                }
            }
        });
        return val;
    },
    calculateUnitCost: function(component, event, helper){
        var qli = component.get('v.quoteline');
       var modalProductCost = component.get("v.modalProductCost");
       var modalFreightCost = component.get("v.modalFreightCost");
       var unitCostPrice = 0;
       
       if(!isNaN(modalProductCost) && modalProductCost!=null && modalProductCost!=''){
           unitCostPrice = helper.roundNumber(modalProductCost,2);
       }
       
       if(!isNaN(modalFreightCost) && modalFreightCost!=null && modalFreightCost!=''){
           var num = parseFloat(unitCostPrice) + parseFloat(modalFreightCost);
           unitCostPrice = helper.roundNumber(num,2);
       }
       
       component.set("v.modalUnitPriceCost", unitCostPrice);
       helper.calculateTotalUnitSellPrice(component,event,helper);
       
    },

    //Total Unit GM% & Product Unit GM% calculation on pop up start
    calculateTotalUnitGMPercentage: function(component, event, helper){
        var unitSellPrice = component.get('v.unitSellPrice');
        var unitCost = component.get('v.unitCostPrice');
        var marginPct = ((parseFloat(unitSellPrice) - parseFloat(unitCost))/(parseFloat(unitSellPrice)))*100;
        component.set("v.marginPct", marginPct);

        var unitProductSell = component.get("v.quoteline.UnitPrice");
        var forecastedUnitProductCost = component.get("v.forecastedUnitProductCost");
        var unitProductGMPercent = (((parseFloat(unitProductSell) - parseFloat(forecastedUnitProductCost))/(parseFloat(unitProductSell))))*100
        component.set("v.unitProductGMPercent",unitProductGMPercent);
    },
    //Total Unit GM% & Product Unit GM% calculation on pop up end
    calculateTotalUnitSellPrice: function(component, event, helper){
        var unitProductSell = component.get("v.quoteline.UnitPrice");
        var freightSellPrice = component.get('v.unitFreightSell');
        var otherSell = component.get("v.otherSell");
        var patternSellPrice = component.get('v.linePatternAndToolingSell');
        var quantity = component.get('v.quantity');
        
        var unitSellPrice = parseFloat(unitProductSell) + parseFloat(freightSellPrice) + parseFloat(otherSell) + (parseFloat(patternSellPrice)/parseFloat(quantity));
        component.set('v.unitSellPrice',unitSellPrice );
        //Total Unit GM% & Product Unit GM% calculation on pop up start
        helper.calculateTotalUnitGMPercentage(component,event,helper);
       
        //Total Unit GM% & Product Unit GM% calculation on pop up end
    },

    setAtrributesToDefaultValue: function(component,event,helper){
        var quoteline = component.get('v.quoteline');
        if (!quoteline.Forecasted_Cost_Increase_Percentage__c)
            quoteline.Forecasted_Cost_Increase_Percentage__c=0.0;
        if(! component.get('v.forecastedUnitProductCost'))
            component.set('v.forecastedUnitProductCost',0.0);
        if (!quoteline.Target_Gross_Margin__c)
            quoteline.Target_Gross_Margin__c='';
        if (!quoteline.UnitPrice)
            quoteline.UnitPrice=0.0;
        if(! component.get('v.modalFreightCost'))
            component.set('v.modalFreightCost',0.0);
        if (!quoteline.Unit_Freight_Markup__c)
            quoteline.Unit_Freight_Markup__c=0.0;
        if(! component.get('v.unitFreightSell'))
            component.set('v.unitFreightSell',0.0);
        if (!quoteline.Pattern_Cost_Price__c)
            quoteline.Pattern_Cost_Price__c=0.0;
        if (!quoteline.Line_Pattern_Tooling_Markup__c)
            quoteline.Line_Pattern_Tooling_Markup__c=0.0;
        if(! component.get('v.linePatternAndToolingSell'))
            component.set('v.linePatternAndToolingSell',0.0);
        if (!quoteline.Other_Duties_Tariffs_Cost__c)
            quoteline.Other_Duties_Tariffs_Cost__c=0.0;
        if (!quoteline.Other_Duties_Tariffs_Markup__c)
            quoteline.Other_Duties_Tariffs_Markup__c=0.0;  
        if(! component.get('v.otherSell'))
            component.set('v.otherSell',0.0);     
        component.set('v.quoteline',quoteline) 
            
        
        
            
    }
 
  
})