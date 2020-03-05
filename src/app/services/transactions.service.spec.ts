import { TestBed, inject } from '@angular/core/testing';

import { TransactionsService } from './transactions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService, Sort } from '@nextgen/web-care-portal-core-library';
import { AllRecordsCriteria } from '@nextgen/web-care-portal-core-library/lib/services/data/models/all.records.criteria';
import { of } from 'rxjs';
import mockTransactions from '@mocks/orchestrator/transaction/list.of.transactions.json';

describe('TransactionsService', () => {
  let service: TransactionsService;
  const dataService: Partial<DataService> = {
    getAllRecords(criteria: string | AllRecordsCriteria, pageSize?: number, restartRowId?: string, sort?: Sort[]) {
      return of({
        data: mockTransactions,
        restartRowId: '0'
      });
    }
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      TransactionsService,
      {
        provide: DataService,
        useValue: dataService
      }
    ]
  }));

  beforeEach(inject([TransactionsService], transactionsServcie => {
    service = transactionsServcie;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get transactions', () => {
    service.getTransactions('0').subscribe((response) => {
      expect(response).toBeDefined();
      expect(response.data.length).toEqual(3);
    });
  });
});
