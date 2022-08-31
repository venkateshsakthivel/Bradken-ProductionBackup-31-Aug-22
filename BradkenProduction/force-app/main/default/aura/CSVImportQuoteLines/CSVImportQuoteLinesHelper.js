({
    parseFile : function(component,event,helper) {
        var fileInput = component.find("file").getElement();
        var loadedFile = fileInput.files[0];
        if (!loadedFile) {
            component.find('notifLib').showToast({
                "variant": "error",
                "title": $A.get("{!$Label.c.CSV_Error_Header}"),
                "message": $A.get("{!$Label.c.CSV_Error_FileEmpty}"),
                closeCallback: function() {}
            });
        }else if (loadedFile.size > component.get("v.maxFileSize")) {
            component.find('notifLib').showToast({
                "variant": "error",
                "title": $A.get("{!$Label.c.CSV_Error_Header}"),
                "message": $A.get("{!$Label.c.CSV_FileSizeExceededError}"),
                closeCallback: function() {}
            });
        }else{
            event.getSource().set("v.disabled",true);
            helper.parseCSV(component,helper,loadedFile);
        }
    },
    parseComplete:function(component,helper){
        return $A.getCallback(function(results,file) {
            console.log("Parsing complete:", results, file);
            component.find("importBtn").set("v.disabled",false);
            component.set('v.parseResult',results);
            helper.handleCSVResults(component,helper,results);
        });
    }, 
    handleCSVResults : function(component,helper,results) {
        var fieldMappings = component.get("v.fieldMappings");
        var headers = results.meta.fields;
        component.set('v.headers',headers);
        var sfRows = new Array();
		results.data.forEach(function(row){
            if(row){
                var sfRow = {};
                headers.forEach(function(header){
                    var sField = fieldMappings[header];
                    if(sField && row[header]){
                        sfRow[sField] = row[header];
                    }
                });
                sfRows.push(sfRow);
            }
        });
		component.set('v.rows',sfRows);
		//component.set('v.rows',results.data);
    },
    parseCSV : function(component,helper,loadedFile) {
        var errorFn = $A.getCallback(function(err, file) {
            console.log("ERROR:", err, file);
        });
        var config = {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: 'greedy' 
        };
        config.complete = helper.parseComplete(component,helper);
        config.error = errorFn;
        Papa.parse(loadedFile, config);
    },
    saveRecords : function(component,event,helper) {
		var spinner = component.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        var importRecordsAction = component.get("c.importRecords");
        importRecordsAction.setParams({
            parentId : component.get("v.recordId"),
            headers: component.get('v.headers'),
            rows:  component.get('v.rows')
        });
        importRecordsAction.setCallback(this, function(response){
            $A.util.toggleClass(spinner, "slds-hide");
            var state = response.getState();
            if(state === 'SUCCESS'){
                var res= JSON.parse(response.getReturnValue());
                var message = res.message;
                if(res.success){
					$A.get('e.force:refreshView').fire();
					var results = JSON.parse(res.message);console.log(results);
                    helper.handleSaveResult(component,event,helper,results);
                }else{
                    component.find("importBtn").set('v.disabled',false);
                    component.find('notifLib').showToast({
                        "variant": "error",
                        "title": $A.get("{!$Label.c.CSV_Error_Header}"),
                        "message": message,
                        closeCallback: function() {}
                    });
                }
            }else{
                component.find("importBtn").set('v.disabled',false);
                component.find('notifLib').showToast({
                    "variant": "error",
                    "title": $A.get("{!$Label.c.CSV_Error_Header}"),
                    "message": $A.get("{!$Label.c.CSV_Error_Apex_Message}"),
                    closeCallback: function() {}
                });
            }
        });
        $A.enqueueAction(importRecordsAction);
    },
    getFieldMappings : function(component,event,helper) {
		var spinner = component.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        var getFieldMappingsAction = component.get("c.getFieldMapConfig");
        getFieldMappingsAction.setParams({
            sObjectName : component.get("v.sObjectName")
        });
        getFieldMappingsAction.setCallback(this, function(response){
            $A.util.toggleClass(spinner, "slds-hide");
            var state = response.getState();
            if(state === 'SUCCESS'){
                var res= response.getReturnValue();
                component.set("v.fieldMappings",res);
            }else{
                component.find('notifLib').showToast({
                    "variant": "error",
                    "title": $A.get("{!$Label.c.CSV_Error_Header}"),
                    "message": $A.get("{!$Label.c.CSV_Error_Apex_Message}"),
                    closeCallback: function() {}
                });
            }
        });
        $A.enqueueAction(getFieldMappingsAction);
        
        
        var getExistingQuoteLineItemsCountAction = component.get("c.getExistingQuoteLineItemsCount");
        getExistingQuoteLineItemsCountAction.setParams({
            ParentId : component.get("v.recordId")
        });
        getExistingQuoteLineItemsCountAction.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
				var res= response.getReturnValue();
                component.set("v.existingQLICount",res);
            }else{
                component.find('notifLib').showToast({
                    "variant": "error",
                    "title": $A.get("{!$Label.c.CSV_Error_Header}"),
                    "message": $A.get("{!$Label.c.CSV_Error_Apex_Message}"),
                    closeCallback: function() {}
                });
            }
        });
        $A.enqueueAction(getExistingQuoteLineItemsCountAction);
    },
    handleSaveResult:function(component,event,helper,results){
        component.set('v.showSaveResult',true);
        component.set('v.recordsInserted',Object.keys(results[0]).length);
        component.set('v.recordsFailed',Object.keys(results[1]).length);
        var parseResult = component.get('v.parseResult');
        var failedRows = new Array();
        var csv = '';
        parseResult.data.forEach(function(row,i){
            if(row){
                row['ErrorReason'] = '';
                if(results[1][i]){
                  console.log(results[1][i]);
                  row['ErrorReason'] = results[1][i];
                }
               failedRows.push(row);
            }   
        });
        
        if(component.get("v.recordsFailed") > 0){
        	csv = Papa.unparse(failedRows);
        	component.set("v.csv",csv);
        	helper.downloadCSV(component,event,helper);
            helper.postChatterFeed(component,event);
        }else{
            var qliEditEvent = component.getEvent("QuoteLineEditorEvent");
            qliEditEvent.setParams({action: "reset",payload:""});
            qliEditEvent.fire();
        }
		$A.get('e.force:refreshView').fire();

        component.set("v.disableInputs",false);
    },
    downloadCSV:function(component,event,helper){
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(component.get('v.csv'));
        hiddenElement.target = '_self'; 
        hiddenElement.download = $A.get("{!$Label.c.CSV_DownloadFileName}")+Date.now().toString()+'.csv';  
        document.body.appendChild(hiddenElement); 
        hiddenElement.click(); 
    },
    postChatterFeed:function(component, event){
    	var postChatterFeedMessage = component.get("c.postChatterFeedForFailedQuoteLineItems");
        postChatterFeedMessage.setParams({
    		parentId : component.get("v.recordId"),
    		failedRecordsCount : component.get("v.recordsFailed"),
    		totalRecords : component.get("v.rows").length,
        });
        $A.enqueueAction(postChatterFeedMessage);
	}
})