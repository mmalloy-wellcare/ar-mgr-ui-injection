import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { ActivityComponent } from './activity.component';
import { TransactionsService } from 'src/app/services/transactions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AlertsService, SortService, Sort } from '@nextgen/web-care-portal-core-library';
import { of, throwError } from 'rxjs';
import mockTransactions from '@mocks/orchestrator/transaction/list.of.transactions.json';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  const transactionsService: Partial<TransactionsService> = {
    getTransactions(restartRowId: string, sort: Array<Sort>) {
      return of({
        data: mockTransactions,
        restartRowId: '0'
      });
    }
  };
  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {}
  };
  const sortService: Partial<SortService> = {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityComponent ],
      imports: [HttpClientTestingModule],
      providers: [{
        provide: TransactionsService,
        useValue: transactionsService
      }, {
        provide: AlertsService,
        useValue: alertsService
      }, {
        provide: SortService,
        useValue: sortService
      }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('load transactions', () => {
    it('should load transactions', () => {
      component.gridData = [];
      component.loadGridData();
      expect(component.gridData.length).toEqual(3);
    });

    it('should show error if load transactions fails',
      inject([AlertsService, TransactionsService], (alertsServiceInject, transactionsServiceInject) => {
        spyOn(transactionsServiceInject, 'getTransactions').and.returnValue(throwError({
          status: 404
        }));
        spyOn(alertsServiceInject, 'showErrorSnackbar');
        component.loadGridData();
        expect(transactionsServiceInject.getTransactions).toHaveBeenCalled();
        expect(alertsServiceInject.showErrorSnackbar).toHaveBeenCalled();
      }
    ));
  });
});
