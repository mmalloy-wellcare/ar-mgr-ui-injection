import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { InvoiceService } from '@app/services/invoice.service';
import { AlertsService } from '@nextgen/web-care-portal-core-library';
import { GemsService, GemsAuth } from 'gems-core';

@Component({
  selector: 'ar-mgr-ui-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent {
  @Input() set subscriberId(subId: string) {
    this.subscribId = subId;
    this.loadInvoiceDetails();
  }
  get subscriberId() {
    return this.subscribId;
  }
  invoiceData: any;
  loadingInvoices: boolean;
  filter = {
    rejected: false,
    voided: false
  };
  filteredData: any;
  customHeaders = {
    includeRejected: 'false',
    includeVoided : 'false'
  };
  showInException: boolean;
  gemsAuthAccountInvoiceView: GemsAuth = {
    accessType: this.gemsService.READ,
    componentId: 'account-billing-invoices-view'
  };
  gemsAuthAccountInvoiceGenerate: GemsAuth = {
    accessType: this.gemsService.UPDATE,
    componentId: 'account-billing-invoices-generate'
  };
  private subscribId: string;

  constructor(
    private invoiceService: InvoiceService,
    private alertService: AlertsService,
    private changeDectorRef: ChangeDetectorRef,
    private gemsService: GemsService
  ) { }

  loadInvoiceDetails() {
    this.loadingInvoices = true;
    this.invoiceService.getInvoiceDetails(this.subscriberId, '0', [], this.customHeaders).subscribe(res => {
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
    this.loadInvoiceDetails();
    this.changeDectorRef.detectChanges();
  }

  toggleInException() {
    this.showInException = !this.showInException;

    /* if showInException is true, loop through each invoice. Inside of each invoice, find an inner invoice
     * that shows an exception indicator. If an inner invoice contains an exception indicator, show that invoice,
     * otherwise, hide it*/

    /* if showInExcpetion is false, reload grid without filtering for an exception indicator */
    if (this.showInException) {
      this.loadingInvoices = true;

      this.invoiceData = this.invoiceData.filter((invoice) => {
        invoice.Invoices = invoice.Invoices.filter((innerInvoice) => {
          return innerInvoice.ExceptionInd;
        });

        return invoice.Invoices.length > 0;
      });

      this.loadingInvoices = false;
    } else {
      this.loadInvoiceDetails();
    }
  }
}
