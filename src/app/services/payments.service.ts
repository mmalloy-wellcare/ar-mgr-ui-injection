import { Injectable } from '@angular/core';
import { Sort, DataService, Filter } from '@nextgen/web-care-portal-core-library';
import { map } from 'rxjs/operators';

@Injectable()
export class PaymentsService {
  private pageSize = 100;
  private billingURI = 'premium-billing/ar-mgr/v1/ar';

  constructor(private dataService: DataService) { }

  public getPaymentDetails(subId, restartRowId: string, sort: Array<Sort>, customHeaders?) {
      return this.dataService.getAllRecords(`${this.billingURI}/${subId}/payments`, this.pageSize, restartRowId, sort, customHeaders);
  }
}
