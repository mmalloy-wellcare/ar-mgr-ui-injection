import { Injectable } from '@angular/core';
import { DataService , Filter } from '@nextgen/web-care-portal-core-library';
import { map } from 'rxjs/operators';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  pageSize = 50;

  constructor(private dataService: DataService) { }

  getInvoiceDetails(restartRowId: string, filter: Array<Filter>) {
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
