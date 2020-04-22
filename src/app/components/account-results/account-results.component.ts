import { Component, Input, Output, EventEmitter, ViewContainerRef, HostBinding } from '@angular/core';
import { Filter, AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { AccountsService } from 'src/app/services/accounts.service';
import { Column } from 'src/app/models/column.model';
import { Overlay } from '@angular/cdk/overlay';
import { SortDescriptor } from '@progress/kendo-data-query';
import { ToggleableColumnsGridComponent } from '../toggleable-columns-grid/toggleable-columns-grid.component';
import accountResultsColumns from './account-results-columns.json';

@Component({
  selector: 'pb-ar-ui-account-results',
  templateUrl: './account-results.component.html'
})
export class AccountResultsComponent extends ToggleableColumnsGridComponent {
  @HostBinding('class') componentClass = 'web-component-flex';
  private searchCriteriaInput: Array<Filter>;
  @Input() showResults: boolean;
  @Input() set searchCriteria(value: Array<Filter>) {
    // if filters from account search, then get accounts with filter
    this.searchCriteriaInput = value;
    // reset restartRowId since it's a new search
    this.restartRowId = '0';

    if (value) {
      this.selectedKeys = [];
      this.gridData = [];
      this.loadGridData();
    }
  }
  get searchCriteria() {
    return this.searchCriteriaInput || [];
  }
  @Output() accountsLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  // make deep copy of account results columns so it doesn't affect original json when columns array is updated
  columns: Array<Column> = JSON.parse(JSON.stringify(accountResultsColumns));
  // default sort to ascending subscriber id
  sort: SortDescriptor[] = [{
    field: 'SubscrbID',
    dir: 'asc'
  }];

  constructor(
    public sortService: SortService,
    public alertsService: AlertsService,
    public overlay: Overlay,
    public accountsService: AccountsService,
    public viewContainerRef: ViewContainerRef
  ) {
    super(sortService, alertsService, overlay, viewContainerRef);
  }

  loadGridData() {
    const savedRestartRowId = this.restartRowId || '0';
    this.convertedSort = this.sortService.convertSort(this.sort);

    this.accountsService.getAccounts(savedRestartRowId, this.convertedSort, this.searchCriteria).subscribe(response => {
      this.gridData = this.gridData.concat(response.data);
      this.restartRowId = response.restartRowId;
      this.accountsLoaded.emit(true);
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
      this.accountsLoaded.emit(false);
    });
  }

  showDependents(dataItem: any) {
    return dataItem.Members;
  }
}
