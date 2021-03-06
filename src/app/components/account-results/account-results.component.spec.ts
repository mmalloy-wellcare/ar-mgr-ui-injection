import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { AccountResultsComponent } from './account-results.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SortService, AlertsService } from '@nextgen/web-care-portal-core-library';
import { AccountsService } from 'src/app/services/accounts.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA, ViewContainerRef } from '@angular/core';
import { DetailTemplateDirective } from '@progress/kendo-angular-grid';
import { Overlay } from '@angular/cdk/overlay';
import mockAccounts from '@mocks/ar-mgr/ar/list.of.accounts.json';

describe('AccountResultsComponent', () => {
  let component: AccountResultsComponent;
  let fixture: ComponentFixture<AccountResultsComponent>;
  const sortService: Partial<SortService> = {
    convertSort() {}
  };
  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {}
  };
  const accountsService: Partial<AccountsService> = {
    getAccounts(restartRowId, sort, filter) {
      return of({
        data: mockAccounts,
        restartRowId: '0'
      });
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountResultsComponent, DetailTemplateDirective],
      imports: [HttpClientTestingModule],
      providers: [{
        provide: SortService,
        useValue: sortService
      }, {
        provide: AlertsService,
        useValue: alertsService
      }, {
        provide: AccountsService,
        useValue: accountsService
      },
      Overlay,
      ViewContainerRef],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountResultsComponent);
    component = fixture.componentInstance;
    component.showResults = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadGridData', () => {
    it('should load grid data', () => {
      component.loadGridData();
      expect(component.gridData.length).toEqual(4);
    });

    it('show error if loadGridData fails', inject([AccountsService, AlertsService], (accountsServiceInject, alertsServiceInject) => {
      spyOn(accountsServiceInject, 'getAccounts').and.returnValue(throwError({
        status: 404
      }));
      spyOn(alertsServiceInject, 'showErrorSnackbar');
      component.loadGridData();
      expect(alertsServiceInject.showErrorSnackbar).toHaveBeenCalled();
    }));
  });

  describe('searchCritera', () => {
    it('should set search criteria and load grid data if value exists', () => {
      testSearchCriteria([{
        testFilter: 1
      }]);
    });

    it('should not set search criteria and not load grid data if value does not exist', () => {
      testSearchCriteria(undefined);
    });

    function testSearchCriteria(filter) {
      spyOn(component, 'loadGridData');
      component.searchCriteria = filter;
      expect(component.searchCriteria).toEqual(filter || []);
      filter ?
        expect(component.loadGridData).toHaveBeenCalled() :
        expect(component.loadGridData).not.toHaveBeenCalled();
    }
  });

  describe('showDependents', () => {
    it('should return dependents', () => {
      const mockAccount = {
        firstName: 'Jack',
        Members: [{
          firstName: 'Annie'
        }]
      };

      const dependents = component.showDependents(mockAccount);
      expect(dependents).toEqual(mockAccount.Members);
    });
  });
});
