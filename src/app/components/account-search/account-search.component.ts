import { Component, HostBinding, OnInit } from '@angular/core';
import { FormatterService, Filter } from '@nextgen/web-care-portal-core-library';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import accountSearchStates from './states.json';

@Component({
  selector: 'pb-ar-ui-account-search',
  templateUrl: './account-search.component.html'
})
export class AccountSearchComponent implements OnInit {
  @HostBinding('class') componentClass = 'web-component-flex side-padding';
  // states are hardcoded for now. when reference data works, i will change to use api
  states: Array<any> = accountSearchStates;
  showResults: boolean;
  expandSearchCard = true;
  searchCriteria: Array<Filter>;
  accountSearchForm: FormGroup = new FormGroup({
    primaryForm: new FormGroup({
      AccountID: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      SubscrbID: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      MedicareId: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      ExChgSubID: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      SSN: new FormControl(String(), [this.ssnValidator, this.dirtyValidator])
    }),
    secondaryForm: new FormGroup({
      FirstName: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      LastName: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      Dob: new FormControl(String(), this.dirtyValidator),
      AddrLine1: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      City: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      State: new FormControl(String()),
      Zip: new FormControl(String(), [this.zipCodeValidator, this.dirtyValidator])
    })
  });

  constructor(private formatterService: FormatterService) {
    this.accountSearchForm.valueChanges.subscribe(() => {
      /* if primary form is pristine but secondary form is dirty, then search criteria needs at least two
      secondary fields filled out. otherwise show error */
      if (!this.accountSearchForm.get('primaryForm').dirty && this.getChildFormDirtyCount('secondaryForm') === 1) {
        this.accountSearchForm.setErrors({
          searchCriteria: true
        });
      } else {
        this.accountSearchForm.setErrors(null);
      }
    });
  }

  ngOnInit() {
    // form starts out as dirty, mark as pristine on init
    this.accountSearchForm.markAsPristine();
  }

  toggleSearchCard() {
    this.expandSearchCard = !this.expandSearchCard;
  }

  resetSearchCriteria() {
    this.showResults = false;
    this.accountSearchForm.reset();
  }

  submitSearchCriteria(event?: any) {
    const targetType = event && event.target ? event.target.type : 'submit';

    /* if the user presses the enter key, the target type has to be either text or submit.
    this is so that if the user presses enter on the datepicker or state dropdown, they can
    choose their date or state without the form submitting */
    if ((targetType === 'text' || targetType === 'submit') && this.accountSearchForm.dirty && this.accountSearchForm.valid) {
      this.showResults = false;
      this.accountSearchForm.disable();
      this.searchCriteria = this.getSearchFilters();
    }
  }

  private getSearchFilters() {
    const parentFormValues = this.accountSearchForm.value;
    const childrenFormValues = {...parentFormValues.primaryForm, ...parentFormValues.secondaryForm};
    const searchFilters = [];

    // convert date object to string in iso format (yyyy-mm-dd)
    childrenFormValues.Dob = this.formatterService.dateToISOFormat(childrenFormValues.Dob);

    for (const fieldName in childrenFormValues) {
      if (!!childrenFormValues[fieldName]) {
        searchFilters.push({
          operator: 'EQ',
          value: this.getFilterValue(childrenFormValues, fieldName),
          property: fieldName === 'SubscrbID' ? 'IssuerSubID' : fieldName,
          dataType: fieldName === 'Dob' ? 'date' : 'character'
        });
      }
    }

    return searchFilters;
  }

  private getFilterValue(formValues: any, fieldName: string) {
    let filterValue: string;

    switch (fieldName) {
      case 'SubscrbID':
      case 'MedicareId':
      case 'ExChgSubID':
      case 'FirstName':
      case 'LastName':
      case 'AddrLine1':
      case 'City':
        // add asterisk at the end for wildcard search
        filterValue = `${formValues[fieldName].toUpperCase()}*`;
        break;
      default:
        filterValue = formValues[fieldName].toUpperCase();
        break;
    }

    return filterValue;
  }

  inputLengthValidator(control: AbstractControl) {
    // checks if input length is less than 2 characters
    if (control.value && control.value.length < 2) {
      return {
        invalidLength: true
      };
    }

    return null;
  }

  ssnValidator(control: AbstractControl) {
    // checks if input is not a number and length is not either 9 or 4
    if ((control.value && control.value.length !== 9 && control.value.length !== 4) || isNaN(control.value)) {
      return {
        invalidSSN: true
      };
    }

    return null;
  }

  zipCodeValidator(control: AbstractControl) {
    // checks if input is not a number and length is not 5
    if ((control.value && control.value.length !== 5) || isNaN(control.value)) {
      return {
        invalidZipCode: true
      };
    }

    return null;
  }

  dirtyValidator(control: AbstractControl) {
    // checks if there is a value, if not, mark as pristine
    if (!control.value) {
      control.markAsPristine();
    }

    return null;
  }

  private getChildFormDirtyCount(controlName: string) {
    const form = this.accountSearchForm.get(controlName) as FormGroup;
    const controls = form.controls;
    let dirtyCount = 0;

    for (const control in controls) {
      if (controls[control].dirty) {
        dirtyCount++;
      }
    }

    return dirtyCount;
  }

  onAccountsLoaded(accountsLoaded: boolean) {
    this.accountSearchForm.enable();
    // enabling form marks as pristine, need to mark as dirty for search buttons to re-enable
    this.accountSearchForm.markAsDirty();

    if (accountsLoaded) {
      this.showResults = true;
    }
  }
}
