import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';
import getQuoteFacility from '@salesforce/apex/SyncQuoteFacilityController.getQuoteFacility';

export default class SyncQuoteFacility extends LightningElement {
	@api ids;
    @api objectApiName;

	selectedQuoteFacilities = [];
	QuoteFacility;

    connectedCallback() {
        if (this.ids) {
            this.ids = this.ids.split(',').filter(function (e) {
                return e != null && e != '';
            });
        }
		getQuoteFacility({incomingIds: this.ids})
		.then(result => {
			console.log('result:');
			console.log(result);
			this.selectedQuoteFacilities = result;

		})
		.catch(err => {
		});
    }

	handleNext() {
		const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
	}
}