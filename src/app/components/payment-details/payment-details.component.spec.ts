import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed , inject} from '@angular/core/testing';
import { PaymentsService } from '@app/services/payments.service';
import { AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { of, throwError } from 'rxjs';
import { PaymentDetailsComponent } from './payment-details.component';
import mockPaymentDetails from '@mocks/ar-mgr/ar/list.of.payment.details.json';
import { GridComponent as KendoGridComponent } from '@progress/kendo-angular-grid';

describe('PaymentDetailsComponent', () => {
  let component: PaymentDetailsComponent;
  let fixture: ComponentFixture<PaymentDetailsComponent>;

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
    convertSort() {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentDetailsComponent ],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{
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
});
