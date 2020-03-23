import { TestBed, inject } from '@angular/core/testing';

import { AccountsService } from './accounts.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService, Sort } from '@nextgen/web-care-portal-core-library';
import { of } from 'rxjs';

describe('AccountsService', () => {
  let service: Partial<AccountsService>;
  const dataService: Partial<DataService> = {
    getAllRecords(url, pageSize, restartRowId, sort) {
      return of({
        data: [{
          account: 1,
          Addresses: [{
            address: 1
          }]
        }, {
          account: 2
        }],
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

  beforeEach(inject([AccountsService], accountsService => {
    service = accountsService;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get accounts', () => {
    service.getAccounts('0', [], []).subscribe((response) => {
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.length).toEqual(2);
    });
  });
});
