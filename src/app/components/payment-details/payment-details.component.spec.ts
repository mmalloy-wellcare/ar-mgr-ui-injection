import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed , inject} from '@angular/core/testing';
import { PaymentsService } from '@app/services/payments.service';
import { AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { of, throwError } from 'rxjs';
import { PaymentDetailsComponent } from './payment-details.component';
import mockPaymentDetails from '@mocks/ar-mgr/ar/list.of.payment.details.json';
import { GridComponent as KendoGridComponent, GridComponent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { GemsAuthorizedDirective } from 'gems-core';
import { GemsService } from 'gems-core';

describe('PaymentDetailsComponent', () => {
  let component: PaymentDetailsComponent;
  let fixture: ComponentFixture<PaymentDetailsComponent>;
  let gemsService: GemsService;

  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {},
    showSuccessSnackbar() {}
  };

  const paymentsService: Partial<PaymentsService> = {
    getPaymentDetails() {
      return of({
        data: mockPaymentDetails
      });
    }
  };

  const sortService: Partial<SortService> = {
    convertSort(sort: SortDescriptor[]) {
      return [{
        property: sort[0].field,
        direction: sort[0].dir
      }];
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentDetailsComponent, GemsAuthorizedDirective ],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        GemsService,
        HttpClientTestingModule,
        {
        provide: AlertsService,
        useValue: alertsService
      }, {
        provide: PaymentsService,
        useValue: paymentsService,
      }, {
        provide: SortService,
        useValue: sortService
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    gemsService = TestBed.get(GemsService);
    component.kendoGrid = {
      expandRow(index: number) { },
      collapseRow(index: number) { },
      wrapper: {
        nativeElement: {
          querySelector() {}
        }
      }
    } as GridComponent;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load payment details data', () => {
    component.subscriberId = '827321841';
    component.loadGridData();

    expect(component.paymentDetails.length).toEqual(2);
    expect(component.subscriberId).toEqual('827321841');
  });

  it('should show error snackbar if error is thrown', inject(
    [PaymentsService, AlertsService], (paymentsServiceInject, alertsServiceInject) => {
      spyOn(alertsServiceInject, 'showErrorSnackbar');
      spyOn(paymentsServiceInject, 'getPaymentDetails').and.returnValue(throwError({ status: 404 }));

      component.loadGridData();
      expect(alertsServiceInject.showErrorSnackbar).toHaveBeenCalled();
    })
  );

  describe('toggleNotes', () => {
    it('should display the notes when expanded', () => {
      spyOn(component.kendoGrid, 'expandRow');
      component.isNotesExpandedMap.clear();
      component.toggleNotes(0);
      expect(component.kendoGrid.expandRow).toHaveBeenCalled();
    });

    it('should hide the notes when colapse', () => {
      spyOn(component.kendoGrid, 'collapseRow');
      component.isNotesExpandedMap.set(0, true);
      component.toggleNotes(0);
      expect(component.kendoGrid.collapseRow).toHaveBeenCalled();
    });
  });

  describe('onSortChange', () => {
    it('should update "PymtStagingSk"', () => {
      testOnSortChange('PymtStagingSk', 'pymt.pymtStagingSk');
    });

    it('should update "AppliedPymtAmt"', () => {
      testOnSortChange('AppliedPymtAmt', 'ApldPymtAmt');
    });

    it('should update "PymtAmt"', () => {
      testOnSortChange('PymtAmt', 'ApldPymtAmt');
    });

    it('should update "CreatedTs"', () => {
      testOnSortChange('CreatedTs', 'pymtStagingCreatedTs');
    });

    it('should update "LastModifiedDt"', () => {
      testOnSortChange('LastModifiedDt', 'pymtStagingLastModfdTs');
    });

    it('should update "LastModifiedBy"', () => {
      testOnSortChange('LastModifiedBy', 'pymtStagingLastModfdBy');
    });

    it('should update "ThirdPartyPayorId"', () => {
      testOnSortChange('ThirdPartyPayorId', 'ThirdPartyPayerId');
    });

    function testOnSortChange(initialField: string, expectedField: string) {
      const sortDescriptor = [{
        field: initialField,
        dir: 'asc'
      }] as SortDescriptor[];

      component.onSortChange(sortDescriptor);
      expect(component.convertedSort[0].property).toEqual(expectedField);
    }
  });
});
