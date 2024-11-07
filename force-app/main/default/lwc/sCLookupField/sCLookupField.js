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
  focusedIndex = -1;

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
    if (this.clickedOnComponent) {
      this.clickedOnComponent = false;
    } 
    else { 
      this.showDropdown = false;
      this.focusedIndex = -1;
    }
  }

  handleInputClick() {
    if(!this.showDropdown) {
      this.fetchLookupRecordsImperative();
    }
    this.clickedOnComponent = true;
    this.showDropdown = true;
  }

  handleInputFocus() {
    if(!this.showDropdown) {
      this.fetchLookupRecordsImperative();
    }
    this.showDropdown = true;
  }

  handleListClick(event) {
    this.selectLookupRecord(event.currentTarget.dataset.label, event.currentTarget.dataset.value);
  }

  handleInputKeyUp(event) {
    switch (event.keyCode) {
      case 40: // Arrow down
        this.focusNextItem();
        break;
      case 38: // Arrow up
        this.focusPreviousItem();
        break;
      case 13: // Enter key
        this.selectFocusedItem();
        break;
      case 27: // Esc key
        this.showDropdown = false;
        this.focusedIndex = -1;
        break;
      default:
        if(this.search !== event.target.value) {
          this.search = event.target.value;
          this.fetchLookupRecordsImperative();
        }
    }
  }

  handleCrossIconClick() {
    this.selectLookupRecord('', '');
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

  focusNextItem() {
    if (this.lookupResults.length > 0) {
      this.focusedIndex = (this.focusedIndex + 1) % this.lookupResults.length;
      this.updateFocus();
    }
  }

  focusPreviousItem() {
    if (this.lookupResults.length > 0) {
      this.focusedIndex =
        this.focusedIndex === 0 ? this.lookupResults.length - 1 : this.focusedIndex - 1;
      this.updateFocus();
    }
  }

  updateFocus() {
    this.template.querySelectorAll('.dropdown-container__list-item').forEach((item, index) => {
      if (index === this.focusedIndex) {
        item.classList.add('focused-item');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('focused-item');
      }
    });
  }

  selectFocusedItem() {
    if (this.focusedIndex !== -1 && this.lookupResults.length > 0) {
      const {value, label} = this.lookupResults[this.focusedIndex];
      this.selectLookupRecord(label, value);
    }
  }

  selectLookupRecord(label, value) {
    this.template.querySelector('.slds-input').blur();
    this.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
      detail: {
        name: this.name,
        value: value
      }
    }));
    this.selectedLabel = label;
    this.search = '';
    this.showDropdown = false;
    this.focusedIndex = -1;
  }
}