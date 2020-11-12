import { async, TestBed, inject } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '@nextgen/web-care-portal-core-library';
import { of } from 'rxjs';
import { AllRecordsCriteria } from '@nextgen/web-care-portal-core-library/lib/services/data/models/all.records.criteria';
import 'rxjs/add/observable/of';
import { PaymentsService } from './payments.service';

let dataService: Partial<DataService>;

describe('PaymentsService', () => {
  let service: PaymentsService;

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
        PaymentsService,
        {
          provide: DataService,
          useValue: dataService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(inject([PaymentsService], paymentsServiceInject => {
    service = paymentsServiceInject;
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get payment details', () => {
      service.getPaymentDetails('12345678', '0', []).subscribe(response => {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.data.length).toEqual(1);
      });
  });
});
