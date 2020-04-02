import { Injectable } from '@angular/core';
import { DataService, Sort, Filter } from '@nextgen/web-care-portal-core-library';
import { map } from 'rxjs/operators';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  pageSize = 50;

  constructor(private dataService: DataService) { }

  getAccounts(restartRowId: string, sort: Array<Sort>, filter: Array<Filter>) {
    return this.dataService.getAllRecords({
      url: 'premium-billing/ar-mgr/v1/ar/member/search',
      pageSize: this.pageSize,
      restartRowId,
      sort,
      filter
    }).pipe(map((response) => {
      return {
        data: this.flattenAddresses(response.data),
        restartRowId: response.restartRowId
      };
    }));
  }

  getAccountById(subscriberId: number) {
    return this.dataService.getSingleRecord(`premium-billing/ar-mgr/v1/ar/accounts/${subscriberId}`);
  }

  private flattenAddresses(accounts: Array<Account>) {
    const updatedAccounts: Array<Account> = [];

    // address comes from backend as array
    // for now there will be one address, but in the future, there will be multiple
    // will have to update logic to show address based on address type
    for (const account of accounts) {
      // if address array exists, take first object in array and set it to account
      if (account.Addresses && account.Addresses.length > 0) {
        const updatedAccount = { ...account, ...account.Addresses[0] };
        // add updated account to array of updated accounts
        updatedAccounts.push(updatedAccount);
      } else {
        // if no address array or address array length is zero, push default account
        updatedAccounts.push(account);
      }
    }

    return updatedAccounts;
  }
}
