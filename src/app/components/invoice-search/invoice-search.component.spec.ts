import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { InvoiceSearchComponent } from './invoice-search.component';
import { SortService, AlertsService } from '@nextgen/web-care-portal-core-library';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InvoiceService } from '@app/services/invoice.service';
import { of, throwError } from 'rxjs';
import mockInvoices from '@mocks/ar-mgr/ar/list.of.invoice.details.json';
import { GridComponent } from '@progress/kendo-angular-grid';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceSearchComponent],
      providers: [{
        provide: InvoiceService,
        useValue: invoiceService
      },
      {
        provide: SortService,
        useValue: sortService
      }, {
        provide: AlertsService,
        useValue: alertsService
      }],
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

  describe('onFromDateChange', () => {
    const mockDateChangeEvent = { value: new Date('04/15/2020') };
    it('should set date to FROMCREATEDT field', () => {
      component.onDateChange(mockDateChangeEvent, 'FROMCREATEDT');
      expect(component.createDateFromValue).toEqual('04/15/2020');
    });
  });

  describe('onToDateChange', () => {
    const mockDateChangeEvent = { value: new Date('05/15/2020') };
    it('should set date to TOCREATEDT field', () => {
      component.onDateChange(mockDateChangeEvent, 'TOCREATEDT');
      expect(component.createDateToValue).toEqual('05/15/2020');
    });
  });

  describe('onCreateDateFromBlur', () => {
    const expectedValue = new Date('04/14/2020');
    it('should set date in Create Date From Date Picker', () => {
      component.onDateKeyUp({ target: { value: '04/14/2020' } }, 'FROMCREATEDT');
      expect(component.invoiceSearchForm.get('secondaryForm').get('FROMCREATEDT').value).toEqual(expectedValue);
      expect(component.createDateFromValue).toEqual('04/14/2020');
    });

    it('should set error if the date is invalid', () => {
      dobValidity({ target: { value: '04/14/20' } }, { dateFormControl: true });
    });

    it('should remove error if the dob field is empty', () => {
      dobValidity({ target: { value: '' } }, null);
    });

    function dobValidity(mockData, result) {
      component.onDateKeyUp(mockData, 'FROMCREATEDT');
      expect(component.invoiceSearchForm.get('secondaryForm').get('FROMCREATEDT').value).toEqual('');
      expect(component.invoiceSearchForm.get('secondaryForm').get('FROMCREATEDT').errors).toEqual(result);
    }
  });

  describe('onCreateDateToBlur', () => {
    const expectedValue = new Date('04/14/2020');
    it('should set date in Create Date To Date Picker', () => {
      component.onDateKeyUp({ target: { value: '04/14/2020' } }, 'TOCREATEDT');
      expect(component.invoiceSearchForm.get('secondaryForm').get('TOCREATEDT').value).toEqual(expectedValue);
      expect(component.createDateToValue).toEqual('04/14/2020');
    });

    it('should set error if the date is invalid', () => {
      dobValidity({ target: { value: '04/14/20' } }, { dateFormControl: true });
    });

    it('should remove error if the dob field is empty', () => {
      dobValidity({ target: { value: '' } }, null);
    });

    function dobValidity(mockData, result) {
      component.onDateKeyUp(mockData, 'TOCREATEDT');
      expect(component.invoiceSearchForm.get('secondaryForm').get('TOCREATEDT').value).toEqual('');
      expect(component.invoiceSearchForm.get('secondaryForm').get('TOCREATEDT').errors).toEqual(result);
    }
  });

  describe('onclearField', () => {
    it('should clear the field', () => {
      component.clearField('primaryForm.ISSUERSUBCRBID');
      expect(component.invoiceSearchForm.get('primaryForm').get('ISSUERSUBCRBID').value).toEqual(null);
    });
    it('should clear the Create Date From field', () => {
      component.clearField('secondaryForm.FROMCREATEDT');
      expect(component.invoiceSearchForm.get('secondaryForm').get('FROMCREATEDT').value).toEqual(null);
      expect(component.createDateFromValue).toEqual('');
      expect(component.createDateToValue).toEqual('');
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
});
