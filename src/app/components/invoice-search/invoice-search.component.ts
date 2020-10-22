import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'ar-mgr-ui-invoice-search',
  templateUrl: './invoice-search.component.html'
})
export class InvoiceSearchComponent {
  expandSearchCard = true;
  createDateFromValue = '';
  createDateToValue = '';
  invoiceSearchDateFrom: string;
  invoiceSearchDateTo: string;
  invoiceSearchForm: FormGroup = new FormGroup({
    primaryForm: new FormGroup({
      IssuerID: new FormControl(String()),
      InvoiceID: new FormControl(String())
    }),
    secondaryForm: new FormGroup({
      FirstName: new FormControl(String()),
      MiddleName: new FormControl(String()),
      LastName: new FormControl(String()),
      CreateDateFrom: new FormControl(String()),
      CreateDateTo: new FormControl(String())
    })
  });

  constructor() {}

  toggleSearchCard() {
    this.expandSearchCard = !this.expandSearchCard;
  }

  onFromDateChange(event) {
    // to set value to the Create Date From field when date selected on the Date Picker
    const dateISOString = event.value.toISOString().split('T')[0].split('-');
    this.createDateFromValue = `${dateISOString[1]}/${dateISOString[2]}/${dateISOString[0]}`;
  }

  onToDateChange(event) {
    // to set value to the Create Date To field when date selected on the Date Picker
    const dateISOString = event.value.toISOString().split('T')[0].split('-');
    this.createDateToValue = `${dateISOString[1]}/${dateISOString[2]}/${dateISOString[0]}`;
  }

  onDateFromKeyUp(event) {
    // to set value to the date picker on Blur event
    const dateFormControl = this.invoiceSearchForm.get('secondaryForm').get('CreateDateFrom');
    const dateString = event.target.value;
    this.createDateFromValue = dateString;
    if (dateString.length === 10) {
      dateFormControl.markAsDirty();
      dateFormControl.setValue(new Date(dateString));
    } else {
      dateFormControl.setValue('');
      dateFormControl.setErrors(!!dateString ? { dateFormControl: true } : null);
    }
  }

  onDateToKeyUp(event) {
    // to set value to the date picker on Blur event
    const dateFormControl = this.invoiceSearchForm.get('secondaryForm').get('CreateDateTo');
    const dateString = event.target.value;
    this.createDateToValue = dateString;
    if (dateString.length === 10) {
      dateFormControl.markAsDirty();
      dateFormControl.setValue(new Date(dateString));
    } else {
      dateFormControl.setValue('');
      dateFormControl.setErrors(!!dateString ? { dateFormControl: true } : null);
    }
  }

  clearField(fieldNames: string) {
    this.invoiceSearchForm.get(fieldNames).setValue('');
    if (fieldNames === 'secondaryForm.CreateDateFrom' || fieldNames === 'secondaryForm.CreateDateTo') {
      this.createDateFromValue = '';
      this.createDateToValue = '';
    }
  }

  resetSearchCriteria() {
    this.createDateFromValue = '';
    this.createDateToValue = '';
    this.invoiceSearchForm.reset();
  }
}
