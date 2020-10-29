import { async, TestBed, inject } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '@nextgen/web-care-portal-core-library';
import { of } from 'rxjs';
import { AllRecordsCriteria } from '@nextgen/web-care-portal-core-library/lib/services/data/models/all.records.criteria';
import 'rxjs/add/observable/of';
import { InvoiceService } from './invoice.service';

let dataService: Partial<DataService>;

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async(() => {
    dataService = {
      getAllRecords(critera: AllRecordsCriteria) {
        return of({
          data: [{}],
          restartRowId: '0'
        });
      }
    };

    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        InvoiceService,
        {
          provide: DataService,
          useValue: dataService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(inject([InvoiceService], invoiceServiceInject => {
    service = invoiceServiceInject;
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });


  it('should load reference data list details', () => {
      const customHeaders = {
        includeRejected: false,
        includeVoided: false
      };

      service.getInvoiceDetails('827321841', '0', [], customHeaders).subscribe((response) => {
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
    });
  });

  it('should get invoice search data', () => {
    service.getInvoiceSearchDetails('0', []).subscribe((response) => {
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.length).toEqual(1);
    });
  });
});
