import { TestBed, inject } from '@angular/core/testing';

import { AccountsService } from './accounts.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService, Sort } from '@nextgen/web-care-portal-core-library';
import { of } from 'rxjs';

describe('AccountsService', () => {
  let service: Partial<AccountsService>;
  const singleAccount = {
    SubscrbId: 111213,
    AccountName: 'William Fancyson'
  };
  const dataService: Partial<DataService> = {
    getAllRecords(url, pageSize, restartRowId, sort) {
      return of({
        data: [{
          SubscrbId: '12345',
          Addresses: [{
            address: 1
          }]
        }, {
          SubscrbId: '67891'
        }],
        restartRowId: '0'
      });
    },
    getSingleRecord(url) {
      return of({
        data: singleAccount
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

  it('should get account by subscriber id', () => {
    service.getAccountById(111213).subscribe((response) => {
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data).toEqual(singleAccount);
    });
  });
});
