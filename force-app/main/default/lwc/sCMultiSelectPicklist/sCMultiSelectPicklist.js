import { LightningElement, api, wire, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

// constants
const VALUE_CHANGE = 'valuechange';

export default class SCMultiSelectPicklist extends LightningElement {
    
  // non decorated properties
  picklistField = {};
  options = [];
  emptyOptions = [];
  showDropdown = false;
  clickedOnComponent = false;
  
  // api properties
  @api get value() {
    return this.values;
  };
  set value(valueString) {
    this.values = valueString?.split(';') ?? [];
  }
  @api field;
  @api name;
  @api required;
  @api label;
  @api placeholder = 'Select values';
  @api recordTypeId = '012000000000000AAA'; // null record type id

  // track properties
  @track values = [];

  // wired methods 
  @wire(getPicklistValues, {
    recordTypeId: '$recordTypeId',
    fieldApiName: '$field'
  }) wiredPicklistValues({data, error}) {
    if(data) {
      this.emptyOptions = data.values;
      this.options = data.values.map(option => ({
        ...option,
        checked: this.values.includes(option.value)
      }));
    }
    if(error) {
      console.log('sCMultiSelectPicklist', error);
    }
  }

  // getter methods
  get iconName() {
    return this.showDropdown ? 'utility:chevronup' : 'utility:chevrondown';
  }

  // lifecycle methods
  connectedCallback() {
    // listen to events and close the dropdown
    // when user click outside the dropdown
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
  }

  handleListClick(event) {
    this.selectPicklistValue(event.currentTarget.dataset.value);
    this.clickedOnComponent = true;
  }

  handleCrossIconClick(event) {
    const index = this.values.indexOf(event.currentTarget.dataset.value);
    this.values.splice(index, 1);
    this.toggleCheckBox(event.currentTarget.dataset.value);
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGE, {
        detail: { value: this.values.join(";"), name: this.name }
      })
    );
  }

  handleInputKeyUp(event) {
    if (event.keyCode === 13) {
      this.clickedOnComponent = false;
      this.showDropdown = false;
    }
    this.options = this.emptyOptions
      .filter((option) =>
        option.value.toLowerCase().includes(event.target.value.toLowerCase())
      )
      .map((option) => ({
        ...option,
        ariaLabel : option.label + ' ' + option.checked,
        checked: this.values.includes(option.value)
      }));
  }

  // helper methods
  selectPicklistValue(value) {
    const index = this.values.indexOf(value);
    if (index === -1) {
      this.values.push(value);
    } else {
      this.values.splice(index, 1);
    }
    this.toggleCheckBox(value);
    this.dispatchEvent(
      new CustomEvent(VALUE_CHANGE, {
        detail: { value: this.values.join(";"), name: this.name }
      })
    );
  }

  toggleCheckBox(name) {
    this.options = this.options.map((option) => ({
      ...option,
      checked: name === option.value ? !option.checked : option.checked,
      ariaLabel : option.label + ' ' + name === option.value ? !option.checked : option.checked
    }));
  }
}