import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertsService, SortService, Filter } from '@nextgen/web-care-portal-core-library';
import { BillingPeriodsService } from '@app/services/billing-periods.service';
import { DataResult, GroupDescriptor, process, GroupResult, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings, GridComponent as KendoGridComponent, ColumnSortSettings } from '@progress/kendo-angular-grid';
import { SubColumn } from '@app/models/subcolumn.model';
import { Column } from '@app/models/column.model.js';
import { Overlay } from '@angular/cdk/overlay';
import { ToggleableColumnsGridComponent } from '../toggleable-columns-grid/toggleable-columns-grid.component';
import { debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import activityColumns from './activity-columns.json';

@Component({
  selector: 'ar-mgr-ui-activity',
  templateUrl: './activity.component.html'
})
export class ActivityComponent extends ToggleableColumnsGridComponent implements OnInit {
  @ViewChild('accountBillingPeriodsGrid', { static: false }) accountBillingPeriodsGrid: KendoGridComponent;
  @ViewChild('billPeriodFilterTemplate', { static: false}) billPeriodFilterTemplate;
  private accountIdInput: string;
  billPeriodField = 'blngStmtDt';
  @Input() set accountId(value: string) {
    if (value) {
      this.accountIdInput = value;
      // load data by ascending bill period by default
      this.onActivitySortChange([{
        field: this.billPeriodField,
        dir: 'asc'
      }]);
    }
  }
  get accountId() {
    return this.accountIdInput;
  }
  // using grid view instead of gridata to show groupings by bill period and period span
  gridView: DataResult;
  rowGroups: GroupDescriptor[] = [{
    field: this.billPeriodField,
    dir: null
  }, {
    field: 'billPeriodSpan',
    dir: null
  }];
  selectableSettings: SelectableSettings = {
    checkboxOnly: true,
    mode: 'single'
  };
  sortableSettings: ColumnSortSettings = {
    allowUnsort: false
  };
  dynamicColumnGroups: Array<SubColumn> = [];
  // make deep copy of activity columns so it doesn't affect original json when columns array is updated
  columns: Array<Column> = JSON.parse(JSON.stringify(activityColumns));
  billPeriodYears: Array<number> = [];
  billPeriodFilterControl: FormControl = new FormControl();
  // default filter to revert to when filters are cleared
  defaultFilter: Array<Filter> = [{
    operator: 'LE',
    value: `${new Date().getFullYear()}-12-31`,
    property: this.billPeriodField,
    dataType: 'Date'
  }];
  currentFilter: Array<Filter> = this.defaultFilter;

  constructor(
    public alertsService: AlertsService,
    public sortService: SortService,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    public billingPeriodsService: BillingPeriodsService
  ) {
    super(sortService, alertsService, overlay, viewContainerRef);
  }

  ngOnInit() {
    this.loadGridMetadata();

    // filter bill period when input value changes
    this.billPeriodFilterControl.valueChanges.pipe(debounceTime(500)).subscribe((year) => {
      this.filterBillPeriod(year);
    });
  }

  loadGridData() {
    const savedRestartRowId = this.restartRowId || '0';
    this.gridLoading = true;

    this.billingPeriodsService.getBillingPeriods(this.accountId, savedRestartRowId, this.convertedSort, this.currentFilter)
      .subscribe(response => {
        this.gridData = this.gridData.concat(response.data);
        this.gridView = process(this.gridData, { group: this.rowGroups });
        this.updateGridRows();
        // there's no collapse all grouping method in kendo api, need to collapse children grouping manually by default
        this.collapsePeriodSpans(this.gridView.data);
        // get list of available years from bill period
        // this is to get the range of years to choose from in the filter menu
        this.getBillPeriodYears();
        this.restartRowId = response.restartRowId;
        this.gridLoading = false;
      },
    (error) => {
      this.alertsService.showErrorSnackbar(error);
      this.gridLoading = false;
    });
  }

  loadGridMetadata() {
    // load meta data used in creating dynamic columns for grid
    // 'marketplace' is hardcoded for now until account api can pass back LOB
    this.billingPeriodsService.getBillingPeriodsMetadata('marketplace').subscribe((response) => {
      this.dynamicColumnGroups = response.data;
      this.updateActivityColumns(this.dynamicColumnGroups);
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
    });
  }

  updateGridRows() {
    /* this function makes it so that if you hover over a locked table row, it will highlight
    the adjacent row on the content table as well, and vice-versa
    /* watch for changes made to DOM tree using MutationObserver. in this case, watch for new rows to be added to
    the locked table and the content table */
    // once new rows are added to the tables, update rows
    const mutationObserver = new MutationObserver(() => {
      // get grid tables (locked and content tables)
      const gridTables = this.accountBillingPeriodsGrid.wrapper.nativeElement.querySelectorAll('.k-grid-table');
      const lockedRows = gridTables[0].rows;
      const contentRows = gridTables[1].rows;

      Array.from(lockedRows).forEach((row: HTMLElement, rowIndex: number) => {
        const contentRow = contentRows[rowIndex];

        /* add mouseover and mouseleave listeners to locked and content rows so when a user hovers
        on a row, it hightlights both the locked table and content table's row, and when the user leaves
        it removes that higlight*/
        this.addMutualHoverEvents(contentRow, row);
        this.addMutualHoverEvents(row, contentRow);
      });

      mutationObserver.disconnect();
    });

    mutationObserver.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});
  }

  addMutualHoverEvents(primaryRow: HTMLElement, secondaryRow: HTMLElement) {
    // add mouseover listener to highlight rows when hovered
    primaryRow.addEventListener('mouseover', () => {
      secondaryRow.classList.add('mutual-highlight');
    });
    // add mouseleave listener to remove highlight when user leaves row
    primaryRow.addEventListener('mouseleave', () => {
      secondaryRow.classList.remove('mutual-highlight');
    });
  }

  collapsePeriodSpans(gridViewData: Array<any>) {
    // loop through parent groups
    gridViewData.forEach((parentData, parentIndex) => {
      // loop through children groups and collapse them
      parentData.items.forEach((childData, childIndex) => {
        this.accountBillingPeriodsGrid.collapseGroup(`${parentIndex}_${childIndex}`);
      });
    });
  }

  getBillPeriodYears() {
    if (this.billPeriodYears.length === 0) {
      for (const data of this.gridData) {
        this.billPeriodYears.push(+data.blngStmtDt.split('-')[0]);
      }
    }

    // remove duplicate years using Set and converting it back to array
    this.billPeriodYears = [...new Set(this.billPeriodYears)];
  }

  getFieldAmount(dataItem: any, subColumn: SubColumn) {
    let fieldAmount = 0;

    // if mapping is an array, aggregate field amounts based off array values
    // otherwise, just use the field amount from the mapping
    if (Array.isArray(subColumn.Mapping)) {
      for (const map of subColumn.Mapping) {
        fieldAmount +=  dataItem[map] || 0;
      }
    } else {
      fieldAmount = dataItem[subColumn.Mapping] || 0;
    }

    return fieldAmount;
  }

  getSummaryAmount(group: GroupResult, subColumn: SubColumn) {
    // summary will always be first in group array
    if (Array.isArray(group.items) && group.items.length > 0) {
      return this.getFieldAmount(group.items[0], subColumn);
    }

    return 0;
  }

  updateActivityColumns(groups: Array<SubColumn>) {
    // update columns array based off metadata from backend
    groups.forEach((column, columnIndex) => {
      const parentColumn = {
        field: column.Name,
        title: column.Label,
        hidden: false,
        children: []
      };

      // loop through sub-columns in column group and add child column to children of parent column
      column.SubHeader.forEach((subColumn, subColumnIndex) => {
        const childColumn = {
          field: subColumn.Name,
          title: subColumn.Label,
          hidden: false
        };

        if (subColumnIndex === 0) {
          childColumn[`default`] = true;
        }

        parentColumn.children.push(childColumn);
      });

      this.columns.push(parentColumn);
    });
  }

  filterBillPeriod(year: string = '') {
    let filter: Array<Filter>;

    switch (year.length) {
      case 4:
        filter = [{
          operator: 'GE',
          value: `${year}-01-01`,
          property: this.billPeriodField,
          dataType: 'Date'
        }, {
          operator: 'LE',
          value: `${year}-12-31`,
          property: this.billPeriodField,
          dataType: 'Date'
        }];
        break;
      case 0:
        filter = this.defaultFilter;
        break;
    }

    if (filter) {
      this.currentFilter = filter;
      this.gridData = [];
      /* NOTE: If you're using grouped columns and have attached event listeners to the rows, the only way
      to clear the grid successfully is to set gridView to null, otherwise, the event listeners will not be
      removed and will cause a memory leak.  */
      this.gridView = null;
      this.loadGridData();
    }
  }

  /* NOTE:
  Kendo does not support having a filter row AND filter menus on headers at the same time from
  what I have seen. It's either [filterable]="true" which creates the filter row OR filterable="menu"
  which creates the triggers on the headers.

  Also, using the built in filter menus, the element created is an anchor tag that routes to "#".
  So if you were to use just the built in filter menus, each time you clicked on the trigger, it would
  route you to "#".

  I've decided to use the supported filter row while having my own custom filter menu which solves
  both problems above.
  */
  openFilterMenu(targetElement: HTMLElement) {
    this.showCustomDropdown(targetElement, this.billPeriodFilterTemplate);
  }

  onFilterChange(year?: string) {
    this.filterBillPeriod(year);
    this.overlayRef.dispose();
    // reset the bill period filter input on grid once the filter has changed
    // don't emit value changes on reset, otherwise it will filter again with default filter
    this.billPeriodFilterControl.reset(null, { onlySelf: true, emitEvent: false});
  }

  onActivitySortChange(sort: Array<SortDescriptor>) {
    // set gridView to null on sort change to prevent memory leak with event listeners not being removed from rows
    this.gridView = null;
    this.onSortChange(sort);
  }
}
