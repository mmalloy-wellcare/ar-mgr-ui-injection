import { Injectable } from '@angular/core';
import { Sort, DataService, Filter } from '@nextgen/web-care-portal-core-library';
import { map } from 'rxjs/operators';

@Injectable()
export class InvoiceService {
  private pageSize = 100;
  private billingURI = 'premium-billing/ar-mgr/v1/ar';

  constructor(private dataService: DataService) { }

  public getInvoiceDetails(subId, restartRowId: string, sort: Array<Sort>, customHeaders) {
    return this.dataService.getAllRecords(`${this.billingURI}/${subId}/invoices`, this.pageSize, restartRowId, sort, customHeaders);
  }

  getInvoiceSearchDetails(restartRowId: string, filter: Array<Filter>) {
    return this.dataService.getAllRecords({
      url: 'premium-billing/ar-mgr/v1/ar/invoice/search',
      pageSize: this.pageSize,
      restartRowId,
      filter
    }).pipe(map((response) => {
      return {
        data: response.data,
        restartRowId: response.restartRowId
      };
    }));
  }
}
