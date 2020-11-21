import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { InvoiceDetailsComponent } from './invoice-details.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InvoiceService } from '@app/services/invoice.service';
import { of, throwError } from 'rxjs';
import mockInvoices from '@mocks/ar-mgr/ar/list.of.invoices.json';
import { AlertsService } from '@nextgen/web-care-portal-core-library';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GemsAuthorizedDirective } from 'gems-core';
import { GemsService } from 'gems-core';

describe('InvoiceDetailsComponent', () => {
  let component: InvoiceDetailsComponent;
  let fixture: ComponentFixture<InvoiceDetailsComponent>;
  let gemsService: GemsService;

  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {},
    showSuccessSnackbar() {}
  };

  const invoiceService: Partial<InvoiceService> = {
    getInvoiceDetails() {
      return of({
        data: mockInvoices
      });
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDetailsComponent, GemsAuthorizedDirective ],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        GemsService,
        HttpClientTestingModule,
        {
        provide: AlertsService,
        useValue: alertsService
      }, {
        provide: InvoiceService,
        useValue: invoiceService
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    gemsService = TestBed.get(GemsService);
    component.filter.voided = false;
    component.filter.rejected = false;
    component.customHeaders = {includeRejected: 'false', includeVoided: 'false'};
    component.invoiceData = mockInvoices;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error snackbar if error is thrown', inject(
    [InvoiceService, AlertsService], (invoiceServiceInject, alertsServiceInject) => {
      spyOn(alertsServiceInject, 'showErrorSnackbar');
      spyOn(invoiceServiceInject, 'getInvoiceDetails').and.returnValue(throwError({ status: 404 }));

      component.loadInvoiceDetails(component.customHeaders);
      expect(alertsServiceInject.showErrorSnackbar).toHaveBeenCalled();
    })
  );

  it('should load the invoice data on success', () => {
    component.subscriberId = '827321841';
    component.loadInvoiceDetails(component.customHeaders);

    expect(component.invoiceData.length).toEqual(3);
  });

  it('should filter based upon the custom headers', () => {
    spyOn(component , 'loadInvoiceDetails');
    component.filterInvoices('rejected');

    expect(component.loadInvoiceDetails).toHaveBeenCalledWith(component.customHeaders);
    expect(component.customHeaders.includeRejected).toEqual('true');
    expect(component.customHeaders.includeVoided).toEqual('false');
  });
});
