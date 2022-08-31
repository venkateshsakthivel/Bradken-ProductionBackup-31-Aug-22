import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';
import getQuoteFacility from '@salesforce/apex/EclSelectionController.getQuoteFacility';

export default class EclSelection extends LightningElement {
	@api ids;
	@api ECLSupplierGroup;

	@api selectedQuoteFacilites = [];
	@api selectedQuoteFac = [];

    connectedCallback() {
        if (this.ids) {
            this.ids = this.ids.split(',').filter(function (e) {
                return e != null && e != '';
            });
        }
		getQuoteFacility({incomingIds: this.ids})
		.then(result => {
			this.selectedQuoteFac = result;
		})
		.catch(err => {
		});
    }

	handleFillingGroup(event) {
		this.ECLSupplierGroup = event.target.value;
	}

	handleNext() {
		const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
	}
}