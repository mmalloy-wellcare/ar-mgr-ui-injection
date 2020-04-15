import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { ActivityComponent } from './activity.component';
import { BillingPeriodsService } from '@app/services/billing-periods.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AlertsService, SortService, Sort } from '@nextgen/web-care-portal-core-library';
import { of, throwError } from 'rxjs';
import { GridComponent as KendoGridComponent } from '@progress/kendo-angular-grid';
import mockBillingPeriods from '@mocks/ar-mgr/ar/list.of.billing.periods.json';
import mockMetadata from '@mocks/ar-mgr/ar/list.of.metadata.json';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  const billingPeriodsService: Partial<BillingPeriodsService> = {
    getBillingPeriods(accountId: string, restartRowId: string, sort: Array<Sort>) {
      return of({
        data: mockBillingPeriods,
        restartRowId: '0'
      });
    },
    getBillingPeriodsMetadata(lob: string) {
      return of({
        data: mockMetadata[0].TopHeader
      });
    }
  };
  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {}
  };
  const sortService: Partial<SortService> = {};
  const mockElement = document.createElement('div');
  const mockAccountBillingPeriodsGrid: Partial<KendoGridComponent> = {
    collapseGroup(groupIndex: string) {},
    wrapper: {
      nativeElement: {
        querySelectorAll() {
          return [{
            name: 'locked-table',
            rows: [mockElement]
          }, {
            name: 'content-table',
            rows: [mockElement]
          }];
        }
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityComponent ],
      imports: [HttpClientTestingModule],
      providers: [{
        provide: BillingPeriodsService,
        useValue: billingPeriodsService
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

  describe('loadGridData', () => {
    it('should load billing periods', () => {
      component.gridData = [];
      component.accountBillingPeriodsGrid = mockAccountBillingPeriodsGrid as KendoGridComponent;
      component.loadGridData();
      expect(component.gridData.length).toEqual(3);
    });

    it('should show error if loading billing periods fails',
      inject([AlertsService, BillingPeriodsService], (alertsServiceInject, billingPeriodsServiceInject) => {
        testLoadError(alertsServiceInject, billingPeriodsServiceInject, 'getBillingPeriods');
      }
    ));
  });

  describe('loadGridMetadata', () => {
    it('should load grid metadata for dynamic column groups', () => {
      component.dynamicColumnGroups = [];
      component.loadGridMetadata();
      expect(component.dynamicColumnGroups.length).toEqual(5);
    });

    it('should show error if loading metadata fails',
      inject([AlertsService, BillingPeriodsService], (alertsServiceInject, billingPeriodsServiceInject) => {
        testLoadError(alertsServiceInject, billingPeriodsServiceInject, 'getBillingPeriodsMetadata');
      }
    ));
  });

  function testLoadError(alertsServiceInput, billingPeriodsServiceInput, functionName) {
    spyOn(billingPeriodsServiceInput, functionName).and.returnValue(throwError({
      status: 404
    }));
    spyOn(alertsServiceInput, 'showErrorSnackbar');
    functionName === 'getBillingPeriods' ? component.loadGridData() : component.loadGridMetadata();
    expect(billingPeriodsServiceInput[functionName]).toHaveBeenCalled();
    expect(alertsServiceInput.showErrorSnackbar).toHaveBeenCalled();
  }

  describe('accountId set', () => {
    it('should set account id and load grid data', () => {
      testSetAccountId('123');
    });

    it('should not set account id or load grid data if value is undefined', () => {
      testSetAccountId(undefined);
    });

    function testSetAccountId(accountId) {
      spyOn(component, 'loadGridData');
      component.accountId = accountId;
      expect(component.accountId).toEqual(accountId);
      accountId ?
        expect(component.loadGridData).toHaveBeenCalled() : expect(component.loadGridData).not.toHaveBeenCalled();
    }
  });

  describe('getFieldAmount', () => {
    it('should return aggregate of values if mapping is an array', () => {
      testGetFieldAmount(['testValueOne', 'testValueTwo'], 30);
    });

    it('should return value based on mapping name if mapping is string', () => {
      testGetFieldAmount('testValueOne', 20);
    });

    it('should return zero if no mapping is found with array', () => {
      testGetFieldAmount(['testValueThree', 'testValueFour'], 0);
    });

    it('should return zero if no mapping is found with string', () => {
      testGetFieldAmount('testValueThree', 0);
    });

    function testGetFieldAmount(mappingInput, expectedAmount) {
      const mockDataItem = { testValueOne: 20, testValueTwo: 10 };
      const mockSubColumn = {
        Name: 'testField',
        Label: 'Test Field',
        Mapping: mappingInput
      };
      const fieldAmount = component.getFieldAmount(mockDataItem, mockSubColumn);
      expect(fieldAmount).toEqual(expectedAmount);
    }
  });

  describe('getSummaryAmount', () => {
    it('should return amount based on group items', () => {
      testGetSummaryAmount([{ testValueFive: 99 }], 99);
    });

    it('should return zero if there are no group items', () => {
      testGetSummaryAmount([], 0);
    });

    function testGetSummaryAmount(groupItems, expectedAmount) {
      const mockGroupItems = {
        aggregates: {},
        field: 'testField',
        value: 0,
        items: groupItems
      };
      const mockSubColumn = {
        Name: 'testSummary',
        Label: 'Test Label',
        Mapping: 'testValueFive'
      };
      const summaryAmount = component.getSummaryAmount(mockGroupItems, mockSubColumn);
      expect(summaryAmount).toEqual(expectedAmount);
    }
  });

  describe('addMutualHoverEvents', () => {
    it('should add mutual-highlight class to secondary row if primary row is highlighted', () => {
      testAddMutualHoverEvents('mouseover', 'mutual-highlight');
    });

    it('should remove mutual-highlight class to secondary row if primary row is not highlighted', () => {
      testAddMutualHoverEvents('mouseleave', undefined);
    });

    function testAddMutualHoverEvents(eventName, expectedClass) {
      const event = new Event(eventName);
      component.addMutualHoverEvents(mockElement, mockElement);
      mockElement.dispatchEvent(event);
      expect(mockElement.classList[0]).toEqual(expectedClass);
    }
  });
});
