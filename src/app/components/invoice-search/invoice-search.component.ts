import { Component, OnInit, HostBinding, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import {
  Filter, AlertsService, SortService, FormatterService, ScrollableGridComponent, ValidationService
} from '@nextgen/web-care-portal-core-library';
import { FormGroup, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { InvoiceService } from '@app/services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { RowClassArgs } from '@progress/kendo-angular-grid';

// TODO: Create base search component so code is not duplicate
@Component({
  selector: 'ar-mgr-ui-invoice-search',
  templateUrl: `./invoice-search.component.html`,
  styleUrls: ['./invoice-search.component.scss']
})
export class InvoiceSearchComponent extends ScrollableGridComponent implements OnInit {
  @HostBinding('class') componentClass = 'web-component-flex side-padding scrollable-grid';
  expandSearchCard = true;
  createDateFromValue = '';
  createDateToValue = '';
  invoiceSearchDateFrom: string;
  invoiceSearchDateTo: string;
  restartRowId = '0';
  searchCriteria: Array<Filter>;
  showSearchResults: boolean;
  InvoiceId: string;
  tempGridData: Array<Invoice>;
  notesMap: Map<number, boolean> = new Map();
  invoiceSearchForm: FormGroup = new FormGroup({
    primaryForm: new FormGroup({
      ISSUERSUBCRBID: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      INVOICEID: new FormControl(String(), [this.dirtyValidator])
    }),
    secondaryForm: new FormGroup({
      SUBCRBFIRSTNAME: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      SUBCRBLASTNAME: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      SUBCRBMIDNAME: new FormControl(String(), [this.inputLengthValidator, this.dirtyValidator]),
      FROMCREATEDT: new FormControl(String(), [this.dirtyValidator]),
      TOCREATEDT: new FormControl(String(), [this.dirtyValidator])
    })
  }, {
    validators: [
      this.validateEffectiveDates('secondaryForm', 'FROMCREATEDT', 'TOCREATEDT'),
    ]
  });

  constructor(
    public invoiceService: InvoiceService,
    private formatterService: FormatterService,
    private validationService: ValidationService,
    public sortService: SortService,
    public alertsService: AlertsService
  ) {
    super(sortService, alertsService);
    this.invoiceSearchForm.valueChanges.subscribe(() => {
      /* if primary form is pristine but secondary form is dirty, then search criteria needs at least two
      secondary fields filled out. otherwise show error */
      if (!this.invoiceSearchForm.get('primaryForm').dirty && this.getChildFormDirtyCount('secondaryForm') === 1) {
        this.invoiceSearchForm.setErrors({
          searchCriteria: true
        });
      } else {
        this.invoiceSearchForm.setErrors(null);
      }
    });
  }

  ngOnInit() {
    this.invoiceSearchForm.markAsPristine();
  }

  toggleSearchCard() {
    this.expandSearchCard = !this.expandSearchCard;
  }

  onDateChange(event, dateType) {
    // to set value to the Create Date From, Create Date To field when date selected on the Date Picker
    const dateISOString = event.value.toISOString().split('T')[0].split('-');
    if (dateType === 'FROMCREATEDT') {
      this.createDateFromValue = `${dateISOString[1]}/${dateISOString[2]}/${dateISOString[0]}`;
    } else {
      this.createDateToValue = `${dateISOString[1]}/${dateISOString[2]}/${dateISOString[0]}`;
      this.setToDate();
    }
  }

  onDateKeyUp(event, dateType) {
    // to set value to the date picker on Blur event
    // tslint:disable-next-line: max-line-length
    const dateFormControl = this.invoiceSearchForm.get('secondaryForm').get(dateType);
    const dateString = event.target.value;

    dateFormControl.markAsDirty();

    if (dateType === 'FROMCREATEDT') {
      this.createDateFromValue = dateString;
    } else {
      this.createDateToValue = dateString;
    }

    if (dateString.length === 10) {
      dateFormControl.setValue(new Date(dateString));

      if (dateType === 'TOCREATEDT') {
        this.setToDate();
      }
    } else {
      dateFormControl.setValue('');
      dateFormControl.setErrors(!!dateString ? { dateFormControl: true } : null);
    }
  }

  setToDate() {
    const fromDateControl = this.invoiceSearchForm.get('secondaryForm').get('FROMCREATEDT');

    // set "to date" to be todays date if there is no value "to date"
    if (!fromDateControl.value) {
      fromDateControl.markAsDirty();
      fromDateControl.setValue(new Date());
      this.onDateChange({ value: new Date()}, 'FROMCREATEDT');
    }
  }

  clearField(fieldNames: string) {
    this.invoiceSearchForm.get(fieldNames).reset();
    if (fieldNames === 'secondaryForm.FROMCREATEDT' || fieldNames === 'secondaryForm.TOCREATEDT') {
      this.createDateFromValue = '';
      this.createDateToValue = '';
      this.invoiceSearchForm.get('secondaryForm.TOCREATEDT').reset();
      this.invoiceSearchForm.get('secondaryForm.FROMCREATEDT').reset();
    }
  }

  resetSearchCriteria() {
    this.createDateFromValue = '';
    this.createDateToValue = '';
    this.showSearchResults = false;
    this.invoiceSearchForm.reset();
  }

  submitSearchCriteria(event?: any) {
    const targetType = event && event.target ? event.target.type : 'submit';

    /* if the user presses the enter key, the target type has to be either text or submit.
    this is so that if the user presses enter on the datepicker or state dropdown, they can
    choose their date or state without the form submitting */
    if ((targetType === 'text' || targetType === 'submit') && this.invoiceSearchForm.dirty && this.invoiceSearchForm.valid) {
      const savedRestartRowId = this.restartRowId;

      this.invoiceSearchForm.disable();
      this.showSearchResults = false;
      this.searchCriteria = this.getSearchFilters();

      this.invoiceService.getInvoiceSearchDetails(savedRestartRowId, this.searchCriteria).subscribe(
        (invoice) => {
          this.invoiceSearchForm.enable();
          this.invoiceSearchForm.markAsDirty();
          this.showSearchResults = true;
          this.tempGridData = invoice.data;
          this.gridData = invoice.data;
        },
        (error) => {
          this.invoiceSearchForm.enable();
          this.alertsService.showErrorSnackbar(error);
        }
      );
    }
  }

  private getSearchFilters() {
    const parentFormValues = this.invoiceSearchForm.value;
    const childrenFormValues = { ...parentFormValues.primaryForm, ...parentFormValues.secondaryForm };
    const searchFilters = [];

    // convert date object to string in iso format (yyyy-mm-dd)
    childrenFormValues.FROMCREATEDT = this.formatterService.dateToISOFormat(childrenFormValues.FROMCREATEDT);
    childrenFormValues.TOCREATEDT = this.formatterService.dateToISOFormat(childrenFormValues.TOCREATEDT);

    for (const fieldName in childrenFormValues) {
      if (!!childrenFormValues[fieldName]) {
        searchFilters.push({
          operator: 'EQ',
          value: this.getFilterValue(childrenFormValues, fieldName),
          property: fieldName,
          dataType: fieldName === 'FROMCREATEDT' || fieldName === 'TOCREATEDT' ? 'date' : 'string'
        });
      }
    }
    return searchFilters;
  }

  private getFilterValue(formValues: any, fieldName: string) {
    let filterValue: string;

    switch (fieldName) {
      case 'ISSUERSUBCRBID':
      case 'SUBCRBFIRSTNAME':
      case 'SUBCRBLASTNAME':
        // add asterisk at the end for wildcard search
        filterValue = `${formValues[fieldName].toUpperCase()}*`;
        break;
      default:
        filterValue = formValues[fieldName].toUpperCase();
        break;
    }
    return filterValue;
  }

  private getChildFormDirtyCount(controlName: string) {
    const form = this.invoiceSearchForm.get(controlName) as FormGroup;
    const controls = form.controls;
    let dirtyCount = 0;

    for (const control in controls) {
      if (controls[control].dirty) {
        dirtyCount++;
      }
    }

    return dirtyCount;
  }

  private validateEffectiveDates(parentFormName: string, startControlName: string, endControlName: string): ValidatorFn {
    return (form: FormGroup): { [key: string]: any } | null => {
      const startControl = form.get(parentFormName).get(startControlName);
      const endControl = form.get(parentFormName).get(endControlName);
      this.validationService.dateGreaterThan(startControl, endControl);
      return;
    };
  }

  dirtyValidator(control: AbstractControl) {
    // checks if there is a value, if not, mark as pristine
    if (!control.value) {
      control.markAsPristine();
    }

    return null;
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

  showNotes(index) {
    if (this.notesMap.get(index)) {
      this.kendoGrid.collapseRow(index);
      this.notesMap.delete(index);
    } else {
      this.kendoGrid.expandRow(index);
      this.notesMap.set(index, true);
    }
  }

  displayRecindedItems(isChecked) {
    if (isChecked) {
      this.gridData = this.tempGridData;
    } else {
      this.gridData = this.tempGridData.filter(data => !data.VoidedInvoiceInd);
    }
  }

  recindedRecord(context: RowClassArgs) {
    return {
      'recinded-record': !!context.dataItem.VoidedInvoiceInd
    };
  }
}
