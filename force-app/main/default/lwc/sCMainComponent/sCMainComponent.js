import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
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
}