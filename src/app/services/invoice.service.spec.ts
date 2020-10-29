import { TestBed, inject } from '@angular/core/testing';
import { InvoiceService } from './invoice.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService } from '@nextgen/web-care-portal-core-library';
import { of } from 'rxjs';

describe('InvoiceService', () => {
  let service: Partial<InvoiceService>;
  const dataService: Partial<DataService> = {
    getAllRecords(url, pageSize, restartRowId, sort) {
      return of({
        data: [
            {
              FirstName: 'John',
              InvoiceCreateDate: '2020-10-23',
              INVOICEID: '12345678',
              InvoiceType: 'standard',
              LastName: 'Walker',
              MidName: 'Jenne',
              SubscrbID: '32323232',
              TtlAmtDue: '100.00',
              VoidedInvoiceInd: true
            },
            {
              FirstName: 'Nancy',
              InvoiceCreateDate: '2020-05-23',
              INVOICEID: '87654321',
              InvoiceType: 'standard',
              LastName: 'Jenny',
              MidName: 'Jenne',
              SubscrbID: '32323223',
              TtlAmtDue: '1100.00',
              VoidedInvoiceInd: true
            }
          ],
        restartRowId: '0'
      });
    }
  };
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [{
      provide: DataService,
      useValue: dataService
    }]
  }));

  beforeEach(inject([InvoiceService], invoiceService => {
    service = invoiceService;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get invoice search data', () => {
    service.getInvoiceDetails('0', []).subscribe((response) => {
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.length).toEqual(2);
    });
  });

});
