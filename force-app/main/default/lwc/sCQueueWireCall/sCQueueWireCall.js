import { wire, api, LightningElement } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import PARENT_PICKLIST_FIELD from "@salesforce/schema/SC_Queue_Wire_Call__c.SC_Parent_Picklist__c";
import CHILD_PICKLIST_FIELD from "@salesforce/schema/SC_Queue_Wire_Call__c.SC_Child_Picklist__c";

export default class SCQueueWireCall extends LightningElement {
	@api recordId;

	parentValueToIndexMap;
	parentPicklistValue;
	childPicklistValue;
	childPicklistValue;
	parentPicklistOptions = [];
	childPicklistOptions = [];
	allChildPicklistOptions = [];

	parentPicklistOptionsPromise;
	childPicklistOptionsPromise;
	parentPicklistOptionsResolve;
	childPicklistOptionsResolve;
	getRecordPromise;
	getRecordResolve;

	constructor() {
		super();
		this.parentPicklistOptionsPromise = new Promise((resolve, reject) => {
			this.parentPicklistOptionsResolve = resolve;
		});
		this.childPicklistOptionsPromise = new Promise((resolve, reject) => {
			this.childPicklistOptionsResolve = resolve;
		});
		this.getRecordPromise = new Promise((resolve, reject) => {
			this.getRecordResolve = resolve;
		});
	}

	//     async connectedcallback() {
	//     this.parentPicklistOptions = await parentPicklistValuePromise();
	//     this.parentValueToIndexMap = this.parentPicklistOptions.reduce(
	//       (acc, option, index) => {
	//         acc[option.value] = index;
	//         return acc;
	//       },
	//       {},
	//     );
	//     this.allChildPicklistOptions = await childPicklistOptionsPromise();
	//     const record = await getRecordPromise();
	//     this.parentPicklistValue = getFieldValue(record, PARENT_PICKLIST_FIELD);
	//     this.filterChildPicklistOptions();
	//     this.childPicklistValue = getFieldValue(record, CHILD_PICKLIST_FIELD);
	//   }

	//     @wire(getPicklistValues, {
	//     recordTypeId: "012000000000000AAA", // default recordtypeid
	//     fieldApiName: PARENT_PICKLIST_FIELD,
	//   })
	//   wiredGetParentPicklistValues({ data, error }) {
	//     if (data) {
	//       parentPicklistOptionsResolve(data.values);
	//     }
	//   }

	//   @wire(getPicklistValues, {
	//     recordTypeId: "012000000000000AAA", // default recordtypeid
	//     fieldApiName: CHILD_PICKLIST_FIELD,
	//   })
	//   async wiredGetChildPicklistValues({ data, error }) {
	//     if (data) {
	//       childPicklistOptionsPromise(data.values);
	//     }
	//   }

	//   @wire(getRecord, {
	//     recordId: "$recordId",
	//     fields: [PARENT_PICKLIST_FIELD, CHILD_PICKLIST_FIELD],
	//   })
	//   wiredGetRecord({ data, error }) {
	//     if (data) {
	//       getRecordResolve(data);
	//     }
	//   }

	@wire(getPicklistValues, {
		recordTypeId: "012000000000000AAA", // default recordtypeid
		fieldApiName: PARENT_PICKLIST_FIELD,
	})
	wiredGetParentPicklistValues({ data, error }) {
		if (data) {
			this.parentPicklistOptions = data.values;
			this.parentValueToIndexMap = data.values.reduce((acc, option, index) => {
				acc[option.value] = index;
				return acc;
			}, {});
			this.parentPicklistOptionsResolve();
		}
	}

	@wire(getPicklistValues, {
		recordTypeId: "012000000000000AAA", // default recordtypeid
		fieldApiName: CHILD_PICKLIST_FIELD,
	})
	wiredGetChildPicklistValues({ data, error }) {
		if (data) {
			this.parentPicklistOptionsPromise.then(() => {
				this.allChildPicklistOptions = data.values;
				this.childPicklistOptionsResolve();
			});
		}
	}

	@wire(getRecord, {
		recordId: "$recordId",
		fields: [PARENT_PICKLIST_FIELD, CHILD_PICKLIST_FIELD],
	})
	wiredGetRecord({ data, error }) {
		if (data) {
			this.childPicklistOptionsPromise.then(() => {
				this.parentPicklistValue = getFieldValue(data, PARENT_PICKLIST_FIELD);
				this.filterChildPicklistOptions();
				this.childPicklistValue = getFieldValue(data, CHILD_PICKLIST_FIELD);
			});
		}
	}

	filterChildPicklistOptions() {
		if (!this.parentPicklistValue) {
			this.childPicklistOptions = [];
			return;
		}
		this.childPicklistOptions = this.allChildPicklistOptions.filter((option) =>
			option.validFor.includes(
				this.parentValueToIndexMap[this.parentPicklistValue],
			),
		);
	}

	handleParentChange(e) {
		this.parentPicklistValue = e.detail.value;
		this.filterChildPicklistOptions();
	}

	handleChildChange(e) {
		this.childPicklistValue = e.detail.value;
	}
}
