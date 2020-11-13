import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { InvoiceSearchComponent } from './invoice-search.component';
import { SortService, AlertsService, ValidationService } from '@nextgen/web-care-portal-core-library';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InvoiceService } from '@app/services/invoice.service';
import { of, throwError } from 'rxjs';
import mockInvoices from '@mocks/ar-mgr/ar/list.of.invoice.details.json';
import { GridComponent, RowClassArgs } from '@progress/kendo-angular-grid';

describe('InvoiceSearchComponent', () => {
  let component: InvoiceSearchComponent;
  let fixture: ComponentFixture<InvoiceSearchComponent>;

  const sortService: Partial<SortService> = {
    convertSort() { }
  };
  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() { }
  };
  const invoiceService = {
    getInvoiceSearchDetails() {
      return of({
        data: mockInvoices,
        restartRowId: '0'
      });
    }
  };
  const validationService = {
    dateGreaterThan() {},
    correctDate() {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceSearchComponent],
      providers: [
        { provide: InvoiceService, useValue: invoiceService },
        { provide: SortService, useValue: sortService },
        { provide: AlertsService, useValue: alertsService},
        { provide: ValidationService, useValue: validationService }
      ],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.kendoGrid = {
      expandRow(index: number) { },
      collapseRow(index: number) { },
      wrapper: {
        nativeElement: {
          querySelector() { }
        }
      }
    } as GridComponent;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleSearchCard', () => {
    it('should toggle expandSearchCard', () => {
      component.expandSearchCard = false;
      component.toggleSearchCard();
      expect(component.expandSearchCard).toEqual(true);
    });
  });

  describe('resetSearchCriteria', () => {
    it('should reset form', () => {
      component.invoiceSearchForm.markAsDirty();
      component.resetSearchCriteria();
      expect(component.invoiceSearchForm.dirty).toEqual(false);
    });
  });

  describe('onDateChange', () => {
    it('should set date to FROMCREATEDT field', () => {
      testOnDateChange('FROMCREATEDT', new Date('01/01/1900'), 'createDateFromValue');
    });

    it('should set date to TOCREATEDT field', () => {
      testOnDateChange('TOCREATEDT', new Date('01/01/1900'), 'createDateToValue');
    });

    function testOnDateChange(dateType: string, date: Date, createDateProperty: string) {
      const mockDateChangeEvent = { value: date };
      component.onDateChange(mockDateChangeEvent, dateType);
      expect(component[createDateProperty]).toEqual('01/01/1900');
    }
  });

  describe('onDateKeyUp', () => {
    it('should call setToDate if dateType is FROMCREATEDT', () => {
      testOnDateKeyUp('FROMCREATEDT', '01/01/1900');
      expect(component.setToDate).toHaveBeenCalled();
    });

    it('should not call setToDate if dateType is FROMCREATEDT and input length is greater than 10', () => {
      testOnDateKeyUp('FROMCREATEDT', '01/01/11000');
      expect(component.setToDate).not.toHaveBeenCalled();
    });

    it('should not call setToDate if dateType is TOCREATEDT', () => {
      testOnDateKeyUp('TOCREATEDT', '01/01/1900');
      expect(component.setToDate).not.toHaveBeenCalled();
    });

    it('should set value to blank string if input length is less than 10 but more than 0', () => {
      testOnDateKeyUp('TOCREATEDT', '01/01/1');
      expect(component.invoiceSearchForm.get('secondaryForm.TOCREATEDT').value).toEqual('');
    });

    it('should call clearField if dateType is FROMCREATEDT and input length is 0', () => {
      spyOn(component, 'clearField');
      testOnDateKeyUp('FROMCREATEDT', '');
      expect(component.clearField).toHaveBeenCalled();
    });

    function testOnDateKeyUp(dateType: string, value: string) {
      spyOn(component, 'setToDate');
      const event = {
        target: {
          value
        }
      };
      component.onDateKeyUp(event, dateType);
    }
  });

  describe('setToDate', () => {
    it('should not call onDateChange if "to date" is filled', () => {
      spyOn(component, 'onDateChange');
      component.invoiceSearchForm.get('secondaryForm.TOCREATEDT').setValue(new Date());
      component.setToDate();
      expect(component.onDateChange).not.toHaveBeenCalled();
    });
  });

  describe('clearField', () => {
    it('should clear the field', () => {
      component.clearField('primaryForm.ISSUERSUBCRBID');
      expect(component.invoiceSearchForm.get('primaryForm.ISSUERSUBCRBID').value).toEqual(null);
    });

    it('should clear "from date" and "to date"', () => {
      component.clearField('secondaryForm.FROMCREATEDT');
      expect(component.invoiceSearchForm.get('secondaryForm.FROMCREATEDT').value).toEqual(null);
      expect(component.createDateFromValue).toEqual('');
      expect(component.invoiceSearchForm.get('secondaryForm.TOCREATEDT').value).toEqual(null);
      expect(component.createDateFromValue).toEqual('');
    });

    it('should clear "to date"', () => {
      component.clearField('secondaryForm.TOCREATEDT');
      expect(component.invoiceSearchForm.get('secondaryForm.TOCREATEDT').value).toEqual(null);
      expect(component.createDateFromValue).toEqual('');
    });
  });

  describe('dirtyValidator', () => {
    it('should mark control as pristine if control value is empty', () => {
      testDirtyValidator(null, false);
    });

    it('should NOT mark control as pristine if control value is defined', () => {
      testDirtyValidator('test-id', true);
    });

    function testDirtyValidator(value, dirty) {
      const subIdControl = component.invoiceSearchForm.get('primaryForm.INVOICEID');
      subIdControl.setValue(value);
      subIdControl.markAsDirty();
      component.dirtyValidator(subIdControl);
      expect(subIdControl.dirty).toEqual(dirty);
    }
  });

  describe('submitSearchCriteria', () => {
    it('should set searchCriteria to search filters without keypress event', () => {
      testSubmitSearchCriteria('32323232');
      expect(component.searchCriteria.length).toEqual(2);
    });

    it('should set searchCriteria to search filters with keypress event', () => {
      testSubmitSearchCriteria('32323232', {
        target: {
          type: 'submit'
        }
      });
      expect(component.searchCriteria.length).toEqual(2);
    });

    it('should not set searchCriteria if form is invalid', () => {
      testSubmitSearchCriteria('1');
      expect(component.searchCriteria.length).toEqual(0);
    });

    it('should show error if search fails', inject([InvoiceService, AlertsService], (invoiceServiceInject, alertsServiceInject) => {
      spyOn(alertsServiceInject, 'showErrorSnackbar');
      spyOn(invoiceServiceInject, 'getInvoiceSearchDetails').and.returnValue(throwError({}));
      testSubmitSearchCriteria('32323232');
      expect(alertsServiceInject.showErrorSnackbar).toHaveBeenCalled();
    }));

    function testSubmitSearchCriteria(mockISSUERSUBCRBID, criteria?) {
      component.searchCriteria = [];
      component.invoiceSearchForm.reset();
      component.invoiceSearchForm.get('primaryForm.ISSUERSUBCRBID').setValue(mockISSUERSUBCRBID);
      component.invoiceSearchForm.get('secondaryForm.FROMCREATEDT').setValue(new Date());
      component.invoiceSearchForm.markAsDirty();
      component.submitSearchCriteria(criteria);
    }
  });

  describe('reenableForm', () => {
    it('should enable "to date" if "from date" is filled out', () => {
      testReenableForm(new Date(), false);
    });

    it('should disabled "to date" if "from date" is not filled out', () => {
      testReenableForm(null, true);
    });

    function testReenableForm(dateValue: Date, isDisabled: boolean) {
      component.invoiceSearchForm.disable();
      component.invoiceSearchForm.get('secondaryForm.FROMCREATEDT').setValue(dateValue);
      component.reenableForm();
      expect(component.invoiceSearchForm.get('secondaryForm.TOCREATEDT').disabled).toEqual(isDisabled);
    }
  });

  describe('inputLengthValidator', () => {
    it('should control as valid if length is greater than or equal to 2', () => {
      testValidator('primaryForm', 'ISSUERSUBCRBID', '12', true);
    });

    it('should control as invalid if length is less than 2', () => {
      testValidator('primaryForm', 'ISSUERSUBCRBID', '1', false);
    });
  });

  function testValidator(formType, controlName, controlValue, controlValid) {
    const control = component.invoiceSearchForm.get(`${formType}.${controlName}`);
    control.setValue(controlValue);
    component.inputLengthValidator(control);
    expect(control.valid).toEqual(controlValid);
  }

  describe('showNotes', () => {
    it('should display the notes when expanded', () => {
      spyOn(component.kendoGrid, 'expandRow');
      component.notesMap.clear();
      component.showNotes(0);
      expect(component.kendoGrid.expandRow).toHaveBeenCalled();
    });

    it('should hide the notes when colapse', () => {
      spyOn(component.kendoGrid, 'collapseRow');
      component.notesMap.set(0, true);
      component.showNotes(0);
      expect(component.kendoGrid.collapseRow).toHaveBeenCalled();
    });
  });

  describe('displayRecindedItems', () => {
    it('should display the search results when isChecked is true', () => {
      testDisplayRecindedItem(true, 3);
    });

    it('should display the search results when isChecked is true', () => {
      testDisplayRecindedItem(false, 1);
    });

    function testDisplayRecindedItem(isChecked: boolean, expectedLength: number) {
      component.tempGridData = mockInvoices;
      component.gridData = mockInvoices;
      component.displayRecindedItems(isChecked);
      expect(component.gridData.length).toEqual(expectedLength);
    }
  });

  describe('recindedRecord', () => {
    it('should show "recinded-record" class if "VoidedInvoiceInd" if true', () => {
      testRecindedRecord(true);
    });

    it('should not "recinded-record" class if "VoidedInvoiceInd" if false', () => {
      testRecindedRecord(false);
    });

    function testRecindedRecord(recinded: boolean) {
      const context = {
        dataItem: {
          VoidedInvoiceInd: recinded
        }
      } as RowClassArgs;

      expect(component.recindedRecord(context)['recinded-record']).toEqual(recinded);
    }
  });
});
