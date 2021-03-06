import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { AccountDetailsComponent } from './account-details.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountsService } from '@app/services/accounts.service';
import { of, throwError } from 'rxjs';
import { AlertsService } from '@nextgen/web-care-portal-core-library';

describe('AccountDetailsComponent', () => {
  let component: AccountDetailsComponent;
  let fixture: ComponentFixture<AccountDetailsComponent>;

  const singleAccount = {
    SubscrbId: 123,
    AccountName: 'JOE ALLEN'
  };
  const accountsService: Partial<AccountsService> = {
    getAccountById(subscriberId) {
      return subscriberId === 123 ? of(singleAccount) : of(undefined);
    }
  };
  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountDetailsComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{
        provide: AccountsService,
        useValue: accountsService
      }, {
        provide: AlertsService,
        useValue: alertsService
      }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('load account data', () => {
    it('should get account by subscriber id', () => {
      testLoadAccountData(123, singleAccount);
    });

    it('should set account data as empty object if no account is returned', () => {
      testLoadAccountData(456, {});
    });

    it('should show error snackbar if getting account data fails', inject(
      [AccountsService, AlertsService], (accountsServiceInject, alertsServiceInject) => {
        spyOn(accountsServiceInject, 'getAccountById').and.returnValue(throwError({
          status: 404
        }));
        spyOn(alertsServiceInject, 'showErrorSnackbar');
        component.ngOnInit();
        expect(alertsServiceInject.showErrorSnackbar).toHaveBeenCalled();
      })
    );

    function testLoadAccountData(subscriberId, expectedResult) {
      component.accountData = undefined;
      component.subscriberId = subscriberId;
      component.ngOnInit();
      expect(component.accountData).toEqual(expectedResult);
    }
  });

  describe('onSelectedIndexChange', () => {
    it('should set index to map if index has not been set yet', () => {
      testOnSelectedIndexChange(0);
      expect(component.loadedTabsMap.set).toHaveBeenCalled();
    });

    it('should not set index to map if index has already been set', () => {
      testOnSelectedIndexChange(1);
      expect(component.loadedTabsMap.set).not.toHaveBeenCalled();
    });

    it('should delete index 3 from map even if index 3 has already been set', () => {
      component.loadedTabsMap.set(3, true);
      testOnSelectedIndexDelete(3);
      expect(component.loadedTabsMap.delete).toHaveBeenCalled();
    });

    function testOnSelectedIndexDelete(index: number) {
      spyOn(component.loadedTabsMap, 'delete');
      component.onSelectedIndexChange(index);
    }

    function testOnSelectedIndexChange(index: number) {
      spyOn(component.loadedTabsMap, 'set');
      component.onSelectedIndexChange(index);
    }
  });
});
