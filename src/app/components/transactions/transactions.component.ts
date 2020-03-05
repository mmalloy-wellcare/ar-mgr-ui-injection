import { Component, HostBinding, OnInit } from '@angular/core';
import { GridComponent, AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { TransactionsService } from 'src/app/services/transactions.service';

@Component({
  selector: 'pb-ar-ui-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent extends GridComponent implements OnInit {
  @HostBinding('class') componentClass = 'web-component-flex';
  constructor(
    public alertsService: AlertsService,
    public sortService: SortService,
    private transactionsService: TransactionsService
  ) {
    super(sortService, alertsService);
  }

  ngOnInit() {
    this.loadGridData();
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
