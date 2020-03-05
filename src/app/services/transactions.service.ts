import { Injectable } from '@angular/core';
import { Sort } from '@nextgen/web-care-portal-core-library';
import { DataService } from '@nextgen/web-care-portal-core-library';
import { map } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';

@Injectable()
export class TransactionsService {
  private pageSize = 50;

  constructor(private dataService: DataService) { }

  public getTransactions(restartRowId: string, sort: Array<Sort> = []) {
    return this.dataService.getAllRecords(
      `premium-billing/orchestrator/v1/transactions`,
      this.pageSize,
      restartRowId,
      sort
    ).pipe(map((response) => {
      return {
        data: this.flattenLiabilities(response.data),
        restartRowId: response.restartRowId
      };
    }));
  }

  private flattenLiabilities(transactions: Array<Transaction>) {
    for (const transaction of transactions) {
      if (transaction.Liabilities) {
        transaction[`flattenedLiabilities`] = {};

        for (const liability of transaction.Liabilities) {
          transaction.flattenedLiabilities[liability.LiabilityType] = liability.amt;
        }

        delete transaction.Liabilities;
      }
    }

    return transactions;
  }
}
