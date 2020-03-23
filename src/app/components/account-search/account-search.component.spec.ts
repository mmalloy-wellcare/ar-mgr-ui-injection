import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSearchComponent } from './account-search.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SortService, AlertsService } from '@nextgen/web-care-portal-core-library';

describe('AccountSearchComponent', () => {
  let component: AccountSearchComponent;
  let fixture: ComponentFixture<AccountSearchComponent>;
  const sortService: Partial<SortService> = {};
  const alertsService: Partial<AlertsService> = {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSearchComponent ],
      providers: [{
        provide: SortService,
        useValue: sortService
      }, {
        provide: AlertsService,
        useValue: alertsService
      }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('search criteria warning', () => {
    it('should set searchCriteria error on accountSearchForm', () => {
      testSearchCriteriaWarning(true);
    });

    it('should not set searchCriteria error on accountSearchForm', () => {
      testSearchCriteriaWarning(false);
    });

    function testSearchCriteriaWarning(hasError) {
      component.resetSearchCriteria();
      if (hasError) {
        component.accountSearchForm.get('primaryForm').markAsPristine();
        component.accountSearchForm.get('secondaryForm.Zip').markAsDirty();
        component.accountSearchForm.get('secondaryForm.Zip').setValue('54321');
      } else {
        component.accountSearchForm.get('primaryForm').markAsDirty();
      }
      expect(component.accountSearchForm.hasError('searchCriteria')).toEqual(hasError);
    }
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
      component.accountSearchForm.markAsDirty();
      component.resetSearchCriteria();
      expect(component.accountSearchForm.dirty).toEqual(false);
    });
  });

  describe('submitSearchCriberia', () => {
    it('should set searchCriteria to search filters without keypress event', () => {
      testSubmitSearchCriteria('123456789');
    });

    it('should set searchCriteria to search filters with keypress event', () => {
      testSubmitSearchCriteria('123456789', {
        target: {
          type: 'submit'
        }
      });
    });

    it('should not set searchCriteria if form is invalid', () => {
      testSubmitSearchCriteria('1');
    });

    function testSubmitSearchCriteria(mockSSN, criteria?) {
      component.searchCriteria = [];
      component.accountSearchForm.reset();
      component.accountSearchForm.get('primaryForm.SSN').setValue(mockSSN);
      component.accountSearchForm.get('secondaryForm.Dob').setValue(new Date());
      component.accountSearchForm.markAsDirty();
      component.submitSearchCriteria(criteria);

      expect(component.searchCriteria.length).toEqual(mockSSN.length > 1 ? 2 : 0);
      expect(component.accountSearchForm.disabled).toEqual(mockSSN.length > 1 ? true : false);
    }
  });

  describe('inputLengthValidator', () => {
    it('should control as valid if length is greater than or equal to 2', () => {
      testValidator('primaryForm', 'SubscrbID', 'ok', true);
    });

    it('should control as invalid if length is less than 2', () => {
      testValidator('primaryForm', 'SubscrbID', 'o', false);
    });
  });

  describe('ssnValidator', () => {
    it('should set ssn control as valid', () => {
      testValidator('primaryForm', 'SSN', '123456789', true);
    });

    it('should set ssn control as invalid', () => {
      testValidator('primaryForm', 'SSN', '3', false);
    });
  });

  describe('zipCodeValidator', () => {
    it('should set zip code control as valid', () => {
      testValidator('secondaryForm', 'Zip', '12345', true);
    });

    it('should set zip code control as invalid', () => {
      testValidator('secondaryForm', 'Zip', '1', false);
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
      const subIdControl = component.accountSearchForm.get('primaryForm.SubscrbID');
      subIdControl.setValue(value);
      subIdControl.markAsDirty();
      component.dirtyValidator(subIdControl);
      expect(subIdControl.dirty).toEqual(dirty);
    }
  });

  describe('onAccountsLoaded', () => {
    it('should show results if accounts are loaded', () => {
      testAccountsLoaded(true);
    });

    it('should not show results if accounts are not loaded', () => {
      testAccountsLoaded(false);
    });

    function testAccountsLoaded(loaded) {
      component.showResults = false;
      component.onAccountsLoaded(loaded);
      expect(component.showResults).toEqual(loaded);
    }
  });

  function testValidator(formType, controlName, controlValue, controlValid) {
    const control = component.accountSearchForm.get(`${formType}.${controlName}`);
    control.setValue(controlValue);
    switch (controlName) {
      case 'Zip':
        component.zipCodeValidator(control);
        break;
      case 'SSN':
        component.ssnValidator(control);
        break;
      default:
        component.inputLengthValidator(control);
    }
    expect(control.valid).toEqual(controlValid);
  }
});
