import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import COMMUNICATION_PREFERENCE_FIELD from '@salesforce/schema/Contact.Communication_Preference__c'

export default class SCMainComponent extends LightningElement {

  // non decorated properties
  communicationPreference = '';
  communicationPreferenceField = COMMUNICATION_PREFERENCE_FIELD;

  // api properties
  @api recordId;

  // wire methods
  @wire(getRecord, { recordId: '$recordId',  fields: [COMMUNICATION_PREFERENCE_FIELD] }) wiredContact({data, error}) {
    if(data) {
      this.communicationPreference = getFieldValue(data, COMMUNICATION_PREFERENCE_FIELD);
    }
    if(error) {
      console.log(error);
    }
  }
  
  // lifecycle methods

  // event handlers
  handlePicklistValueChange(event) {
    this.communicationPreference = event.detail.value;  
  }

  saveCommunicationPreference(event) {
    const fields = {};
    fields[COMMUNICATION_PREFERENCE_FIELD.fieldApiName] = this.communicationPreference;
    fields.Id = this.recordId;
    const recordInput = {fields};
    updateRecord(recordInput)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Save success",
            message: "",
            variant: "success",
          })
        );
      })
      .catch((err) => {
        new ShowToastEvent({
          title: "Unable to save communication preference",
          message: err.body.message,
          variant: "error",
        })
      })
  }
}