import { Component, HostBinding, Input } from '@angular/core';
import { PaymentsService } from '@app/services/payments.service';
import { AlertsService, ScrollableGridComponent, SortService } from '@nextgen/web-care-portal-core-library';
import { SortDescriptor } from '@progress/kendo-data-query';
import { GemsService, GemsAuth } from 'gems-core';

@Component({
  selector: 'ar-mgr-ui-payment-details',
  templateUrl: './payment-details.component.html',
})
export class PaymentDetailsComponent extends ScrollableGridComponent {
  @HostBinding('class.web-component-flex') webComponentFlex = true;
  @Input() set subscriberId(subId: string) {
    this.subscribId = subId;

    this.loadGridData();
  }
  get subscriberId() {
    return this.subscribId;
  }

  isNotesExpandedMap: Map<number, boolean> = new Map();
  paymentDetails = [];
  loadingPaymentDetails = false;
  private subscribId;

  public gemsAuthAccountPaymentView: GemsAuth = {
    accessType: this.gemsService.READ,
    componentId: 'account-payment-view'
  };

  constructor(
    public sortService: SortService,
    public alertsService: AlertsService,
    public paymentsService: PaymentsService,
    private gemsService: GemsService
  ) {
    super(sortService, alertsService);
  }

  loadGridData() {
    this.loadingPaymentDetails = true;
    this.paymentsService.getPaymentDetails(this.subscribId , '0', this.convertedSort).subscribe(response => {
      this.paymentDetails = response.data;
      this.loadingPaymentDetails = false;
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
      this.loadingPaymentDetails = false;
    });

  }

  toggleNotes(index) {
    if (this.isNotesExpandedMap.get(index)) {
      this.kendoGrid.collapseRow(index);
      this.isNotesExpandedMap.delete(index);
    } else {
      this.kendoGrid.expandRow(index);
      this.isNotesExpandedMap.set(index, true);
    }
  }

  onSortChange(sort: SortDescriptor[]) {
    this.sort = sort;
    const tempSort = { ...sort[0] };

    switch (tempSort.field) {
      case 'PymtStagingSk':
        tempSort.field = 'pymt.pymtStagingSk';
        break;
      case 'AppliedPymtAmt':
        tempSort.field = 'ApldPymtAmt';
        break;
      case 'PymtAmt':
        tempSort.field = 'ApldPymtAmt';
        break;
      case 'CreatedTs':
        tempSort.field = 'pymtStagingCreatedTs';
        break;
      case 'LastModifiedDt':
        tempSort.field = 'pymtStagingLastModfdTs';
        break;
      case 'LastModifiedBy':
        tempSort.field = 'pymtStagingLastModfdBy';
        break;
      case 'ThirdPartyPayorId':
        tempSort.field = 'ThirdPartyPayerId';
        break;
    }

    this.convertedSort = this.sortService.convertSort([tempSort]);
    this.restartRowId = '0';
    this.gridData = [];
    this.loadGridData();
  }
}
