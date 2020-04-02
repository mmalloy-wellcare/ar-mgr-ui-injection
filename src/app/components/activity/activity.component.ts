import { Component, HostBinding } from '@angular/core';
import { GridComponent, AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { TransactionsService } from 'src/app/services/transactions.service';

@Component({
  selector: 'pb-ar-ui-activity',
  templateUrl: './activity.component.html'
})
export class ActivityComponent extends GridComponent {
  @HostBinding('class') componentClass = 'web-component-flex';

  constructor(
    public alertsService: AlertsService,
    public sortService: SortService,
    private transactionsService: TransactionsService
  ) {
    super(sortService, alertsService);
  }

  loadGridData() {
    const savedRestartRowId = this.restartRowId || '0';
    this.gridLoading = true;

    this.transactionsService.getTransactions(savedRestartRowId, this.convertedSort).subscribe(response => {
      this.gridData = this.gridData.concat(response.data);
      this.restartRowId = response.restartRowId;
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
    }, () => {
      this.gridLoading = false;
    });
  }
}
