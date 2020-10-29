import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { InvoiceService } from '@app/services/invoice.service';
import { AlertsService } from '@nextgen/web-care-portal-core-library';

@Component({
  selector: 'ar-mgr-ui-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent {
  @Input() set subscriberId(subId: string) {
    this.subscribId = subId;
    this.loadInvoiceDetails(this.customHeaders);
  }
  get subscriberId() {
    return this.subscribId;
  }

  invoiceData;
  loadingInvoices;
  filter = {
    rejected: false,
    voided: false
  };
  filteredData: any;
  customHeaders = {
    includeRejected: 'false',
    includeVoided : 'false'
  };
  private subscribId;
  constructor(
    private invoiceService: InvoiceService,
    private alertService: AlertsService,
    private changeDectorRef: ChangeDetectorRef
  ) { }

  loadInvoiceDetails(customHeaders) {
    this.loadingInvoices = true;
    this.invoiceService.getInvoiceDetails(this.subscriberId, '0', [],
      customHeaders).subscribe(res => {
        this.invoiceData = res.data;
        this.loadingInvoices = false;
        this.changeDectorRef.detectChanges();
    }, (error) => {
      this.alertService.showErrorSnackbar(error);
      this.loadingInvoices = false;
    });
  }

  filterInvoices(filterName) {
    this.filter[filterName] = !this.filter[filterName];
    this.customHeaders = {
      includeRejected: `${this.filter.rejected}`,
      includeVoided: `${this.filter.voided}`
    };
    this.loadInvoiceDetails(this.customHeaders);
    this.changeDectorRef.detectChanges();
  }
}
