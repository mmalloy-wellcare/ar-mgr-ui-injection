import { TestBed, inject } from '@angular/core/testing';

import { BillingPeriodsService } from './billing-periods.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService, Sort } from '@nextgen/web-care-portal-core-library';
import { AllRecordsCriteria } from '@nextgen/web-care-portal-core-library/lib/services/data/models/all.records.criteria';
import { of } from 'rxjs';
import mockBillingPeriods from '@mocks/ar-mgr/ar/list.of.billing.periods.json';
import mockMetadata from '@mocks/ar-mgr/ar/list.of.metadata.json';

describe('BillingPeriodsService', () => {
  let service: BillingPeriodsService;
  const dataService: Partial<DataService> = {
    getAllRecords(criteria: string | AllRecordsCriteria, pageSize?: number, restartRowId?: string, sort?: Sort[]) {
      return of({
        data: mockBillingPeriods,
        restartRowId: '0'
      });
    },
    getSingleRecord(url: string) {
      return of(url.includes('marketplace') ? mockMetadata[0] : undefined);
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      BillingPeriodsService,
      {
        provide: DataService,
        useValue: dataService
      }
    ]
  }));

  beforeEach(inject([BillingPeriodsService], billingPeriodsServcie => {
    service = billingPeriodsServcie;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBillingPeriods', () => {
    it('should get billing periods', () => {
      service.getBillingPeriods('827321841', '0').subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.data.length).toEqual(3);
      });
    });
  });

  describe('getBillingPeriodsMetadata', () => {
    it('should get metadata', () => {
      service.getBillingPeriodsMetadata('marketplace').subscribe((response) => {
        testGetMetadata(response, 5);
      });
    });

    it('should return blank array if no metadata is found', () => {
      service.getBillingPeriodsMetadata('fake-lob').subscribe((response) => {
        testGetMetadata(response, 0);
      });
    });

    function testGetMetadata(response, expectedLength) {
      expect(response).toBeDefined();
      expect(response.data.length).toEqual(expectedLength);
    }
  });
});