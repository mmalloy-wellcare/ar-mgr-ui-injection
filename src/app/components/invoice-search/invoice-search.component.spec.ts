import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceSearchComponent } from './invoice-search.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('InvoiceSearchComponent', () => {
  let component: InvoiceSearchComponent;
  let fixture: ComponentFixture<InvoiceSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceSearchComponent],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    const mockDateChangeEvent = {value: new Date('04/15/2020')};
    it('should set date to CreateDateFrom field', () => {
      component.onFromDateChange(mockDateChangeEvent);
      expect(component.createDateFromValue).toEqual('04/15/2020');
    });
  });

  describe('onToDateChange', () => {
    const mockDateChangeEvent = {value: new Date('05/15/2020')};
    it('should set date to CreateDateTo field', () => {
      component.onToDateChange(mockDateChangeEvent);
      expect(component.createDateToValue).toEqual('05/15/2020');
    });
  });

  describe('onCreateDateFromBlur', () => {
    const expectedValue = new Date ('04/14/2020');
    it('should set date in Create Date From Date Picker', () => {
      component.onDateFromKeyUp({target: { value: '04/14/2020'}});
      expect(component.invoiceSearchForm.get('secondaryForm').get('CreateDateFrom').value).toEqual(expectedValue);
      expect(component.createDateFromValue).toEqual('04/14/2020');
    });

    it('should set error if the date is invalid', () => {
      dobValidity({target: { value: '04/14/20'}}, {dateFormControl: true});
    });

    it('should remove error if the dob field is empty', () => {
      dobValidity({target: { value: ''}}, null);
    });

    function dobValidity(mockData, result) {
      component.onDateFromKeyUp(mockData);
      expect(component.invoiceSearchForm.get('secondaryForm').get('CreateDateFrom').value).toEqual('');
      expect(component.invoiceSearchForm.get('secondaryForm').get('CreateDateFrom').errors).toEqual(result);
    }
  });

  describe('onCreateDateToBlur', () => {
    const expectedValue = new Date ('04/14/2020');
    it('should set date in Create Date To Date Picker', () => {
      component.onDateToKeyUp({target: { value: '04/14/2020'}});
      expect(component.invoiceSearchForm.get('secondaryForm').get('CreateDateTo').value).toEqual(expectedValue);
      expect(component.createDateToValue).toEqual('04/14/2020');
    });

    it('should set error if the date is invalid', () => {
      dobValidity({target: { value: '04/14/20'}}, {dateFormControl: true});
    });

    it('should remove error if the dob field is empty', () => {
      dobValidity({target: { value: ''}}, null);
    });

    function dobValidity(mockData, result) {
      component.onDateToKeyUp(mockData);
      expect(component.invoiceSearchForm.get('secondaryForm').get('CreateDateTo').value).toEqual('');
      expect(component.invoiceSearchForm.get('secondaryForm').get('CreateDateTo').errors).toEqual(result);
    }
  });

  describe('onclearField', () => {
    it('should clear the field', () => {
      component.clearField('primaryForm.IssuerID');
      expect(component.invoiceSearchForm.get('primaryForm').get('IssuerID').value).toEqual('');
    });
    it('should clear the Create Date From field', () => {
      component.clearField('secondaryForm.CreateDateFrom');
      expect(component.invoiceSearchForm.get('secondaryForm').get('CreateDateFrom').value).toEqual('');
      expect(component.createDateFromValue).toEqual('');
      expect(component.createDateToValue).toEqual('');
    });
  });

});
