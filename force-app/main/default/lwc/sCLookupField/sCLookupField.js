import { LightningElement, api } from 'lwc';
import fetchLookupRecords from '@salesforce/apex/SC_CustomComponents.fetchLookupRecords';

// constants
const CHANGE_EVENT = 'change';

export default class SCLookupField extends LightningElement {

  // non decorative properties
  loading;
  debounceTimeout;
  selectedLabel;
  search = '';
  lookupResults = [];
  clickedOnComponent = false;
  showDropdown = false;

  // api properties
  @api name;
  @api valueLabel; // label of the record
  @api label;
  @api lookupName;
  @api filterValues;

  // track properties

  // wired methods

  // getter methods

  // lifecycle methods
  connectedCallback() {
    this.selectedLabel = this.valueLabel;
    document.addEventListener("click", () => {
      this.handleDocumentClick();
    });
  }

  disconnectedCallback() {
    document.removeEventListener("click", () => {
      this.handleDocumentClick();
    });
  }

  // event handlers
  handleDocumentClick(event) {
    if (this.clickedOnComponent) this.clickedOnComponent = false;
    else this.showDropdown = false;
  }

  handleInputClick(event) {
    this.clickedOnComponent = true;
    this.showDropdown = true;
    this.loading = true;
    this.fetchLookupRecordsImperative();
  }

  handleListClick(event) {
    this.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
      detail: {
        name: this.name,
        value: event.currentTarget.dataset.value
      }
    }));
    this.selectedLabel = event.currentTarget.dataset.label;
    this.search = '';
  }

  handleInputKeyUp(event) {
    this.search = event.target.value;
    this.fetchLookupRecordsImperative();
  }

  handleCrossIconClick() {
    this.selectedLabel = '';
    this.search = '';
    this.dispatchEvent(CHANGE_EVENT, {
      detail: {
        value: '',
        name: this.name
      }
    })
  }

  // helper methods
  fetchLookupRecordsImperative() {
    clearTimeout(this.debounceTimeout);
    this.loading = true;
    this.debounceTimeout = setTimeout(() => {
      fetchLookupRecords({
        lookupName: this.lookupName,
        searchString: this.search,
        filterValues: this.filterValues
      }).then(result => {
        this.lookupResults = result;
      }).catch(error => {
        console.log(error);
      }).finally(() => {
        this.loading = false;
      })
    }, 500);
  }
}