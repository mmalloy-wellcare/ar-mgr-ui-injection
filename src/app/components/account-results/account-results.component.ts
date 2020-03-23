import { Component, Input, Output, EventEmitter, ViewChild, ViewContainerRef, HostBinding, TemplateRef, ElementRef } from '@angular/core';
import { GridComponent, Filter, AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { AccountsService } from 'src/app/services/accounts.service';
import { Column } from 'src/app/models/column.model';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay } from '@angular/cdk/overlay';
import { SortDescriptor } from '@progress/kendo-data-query';
import accountResultsColumns from './account-results-columns.json';

@Component({
  selector: 'pb-ar-ui-account-results',
  templateUrl: './account-results.component.html'
})
export class AccountResultsComponent extends GridComponent {
  @HostBinding('class') componentClass = 'web-component-flex';
  @ViewChild('columnsDropdownTemplate', { static: false}) columnsDropdownTemplate;
  @ViewChild('columnsDropdownButton', { static: false}) columnsDropdownButton;
  private searchCriteriaInput: Array<Filter>;
  @Input() showResults: boolean;
  @Input() set searchCriteria(value: Array<Filter>) {
    // if filters from account search, then get accounts with filter
    this.searchCriteriaInput = value;

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
  columns: Array<Column> = accountResultsColumns;
  // default sort to ascending subscriber id
  sort: SortDescriptor[] = [{
    field: 'SubscrbID',
    dir: 'asc'
  }];

  constructor(
    public sortService: SortService,
    public alertsService: AlertsService,
    public overlay: Overlay,
    private accountsService: AccountsService,
    private viewContainerRef: ViewContainerRef
  ) {
    super(sortService, alertsService);
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

  isHiddenColumn(field: string) {
    let hidden: boolean;

    // if field matches and hidden is true, hide column
    for (const column of this.columns) {
      if ((column.field === field) && column.hidden) {
        hidden = true;
        break;
      }
    }

    return hidden;
  }

  onColumnSelectionChange(columns: Array<Column>) {
    this.columns = columns;
  }

  showColumnsDropdown() {
    // get columns button (#columnsDropdownButton)
    const columnsDropdownButton = this.columnsDropdownButton._elementRef.nativeElement;

    // create overlay
    const overlayRef = this.overlay.create({
      maxHeight: 400,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      // set dropdown position to columns button
      positionStrategy: this.overlay.position().flexibleConnectedTo(columnsDropdownButton)
        .withPositions([{
          // position to end and bottom of columns dropdown button
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }]),
      // reposition dropdown on scroll
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    // get columns dropdown template
    // template portal represents embedded template (#columnsDropdownTemplate)
    const columnsDropdown = new TemplatePortal(this.columnsDropdownTemplate, this.viewContainerRef);

    // attach columns dropdown to overlay
    overlayRef.attach(columnsDropdown);

    // subscribe to backdropClick so when user clicks outside dropdown, it closes
    overlayRef.backdropClick().subscribe(() => {
      overlayRef.dispose();
    });
  }

  showDependents(dataItem: any) {
    return dataItem.Members;
  }
}
