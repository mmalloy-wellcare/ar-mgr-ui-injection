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
import { AccountDetail } from '@app/models/account-detail.model';
import activityColumns from './activity-columns.json';

@Component({
  selector: 'ar-mgr-ui-activity',
  templateUrl: './activity.component.html'
})
export class ActivityComponent extends ToggleableColumnsGridComponent implements OnInit {
  @ViewChild('accountBillingPeriodsGrid', { static: false }) accountBillingPeriodsGrid: KendoGridComponent;
  @ViewChild('billPeriodFilterTemplate', { static: false}) billPeriodFilterTemplate;
  private accountDataInput: AccountDetail;
  billPeriodField = 'blngStmtDt';
  @Input() set accountData(value: AccountDetail) {
    if (value && value.AccountID) {
      this.accountDataInput = value;
      this.loadGridMetadata();
      // load data by ascending bill period by default
      this.onActivitySortChange([{
        field: this.billPeriodField,
        dir: 'asc'
      }]);
    }
  }
  get accountData() {
    return this.accountDataInput;
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
  // keep track of which bill period spans have been expanded
  periodSpanExpandedMap: Map<string, boolean> = new Map();
  // default filter to revert to when filters are cleared
  defaultFilter: Array<Filter> = [{
    operator: 'LE',
    value: `${new Date().getFullYear()}-12-31`,
    property: this.billPeriodField,
    dataType: 'Date'
  }];
  currentFilter: Array<Filter> = this.defaultFilter;
  highlightedRowIndex = 0;
  lockedRows: HTMLCollectionOf<HTMLTableRowElement>;
  contentRows: HTMLCollectionOf<HTMLTableRowElement>;
  // store mapped cell data so it doesn't need to be calculated again
  /*NOTE: Adding mouseover/mouseleave listeners to the kendo grid fires all functions within
  a kendo cell template. I'm not sure why that is yet.

  For example, with my mouseover/mouseleave listeners on the grid container, if you hover over any cell, my mapping
  function to get the cell data based on the backend's metadata gets called every time.

  For this, I've added a map to check if that cell's data already exists, if it does, then don't call my mapping function.
  That way, if you hover over a cell that already has data, it wouldn't keep calling my mapping function.
  */
  groupCellDataMap: Map<string, any> = new Map();
  includeVoidedRows: boolean;

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
    // filter bill period when input value changes
    this.billPeriodFilterControl.valueChanges.pipe(debounceTime(500)).subscribe((year) => {
      this.filterBillPeriod(year);
    });
  }

  loadGridData() {
    const savedRestartRowId = this.restartRowId || '0';
    this.gridLoading = true;

    this.billingPeriodsService.getBillingPeriods(
      this.accountData.AccountID, savedRestartRowId, this.includeVoidedRows, this.convertedSort, this.currentFilter
    )
      .subscribe(response => {
        this.processGridData(response.data);
        this.saveGridRows();
        // there's no collapse all grouping method in kendo api, need to collapse children grouping manually by default
        this.collapsePeriodSpans(this.gridView.data);
        // get list of available years from bill period
        // this is to get the range of years to choose from in the filter menu
        this.getBillPeriodYears();
        this.restartRowId = response.restartRowId;
      },
    (error) => {
      this.alertsService.showErrorSnackbar(error);
      this.gridLoading = false;
    });
  }

  processGridData(gridData: Array<any>) {
    this.gridData = this.gridData.concat(gridData);
    this.gridView = process(this.gridData, { group: this.rowGroups });
    this.gridLoading = false;
  }

  resetGridData() {
    this.gridData = [];
    this.gridView = null;
    this.highlightedRowIndex = 0;
    this.periodSpanExpandedMap.clear();
  }

  loadGridMetadata() {
    // load meta data used in creating dynamic columns for grid based on lob
    this.billingPeriodsService.getBillingPeriodsMetadata(this.accountData.LobTypeCode).subscribe((response) => {
      this.dynamicColumnGroups = response.data;
      this.updateActivityColumns(this.dynamicColumnGroups);
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
    });
  }

  saveGridRows() {
    const mutationObserver = new MutationObserver(() => {
      // when new rows have been added, save the locked and content rows
      // these rows will be used in the mutual row highlight
      const activityGrid = this.accountBillingPeriodsGrid.wrapper.nativeElement;
      const gridTables = activityGrid.querySelectorAll('.k-grid-table');
      this.lockedRows = gridTables[0].rows;
      this.contentRows = gridTables[1].rows;
      this.addRowHighlightListeners();
      mutationObserver.disconnect();
    });

    mutationObserver.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});
  }

  /* this function adds listeners so that if you hover over a locked table row, it will highlight the adjacent row
  on the content table as well, and vice-versa, making it seem like one "row" is highlighted */
  addRowHighlightListeners() {
    const activityGrid = this.accountBillingPeriodsGrid.wrapper.nativeElement;
    const gridContainer = activityGrid.querySelector('.k-grid-container');

    // check if highlight events are attached to gridContainer, if not, add them
    if (!gridContainer.getAttribute('highlight-events')) {
      // highlight rows on mouseover of grid container
      gridContainer.addEventListener('mouseover', (event) => {
        // find row from event target
        const currentRow = event.target.closest('tr');
        this.toggleMutualHighlight(currentRow);
      });
      // remove highlight from rows on mouseleave of grid container
      gridContainer.addEventListener('mouseleave', () => {
        this.toggleMutualHighlight();
      });
      gridContainer.setAttribute('highlight-events', 'true');
    }
  }

  toggleMutualHighlight(currentRow?: HTMLTableRowElement) {
    // remove highlight on previous rows before highlighting current row
    this.lockedRows[this.highlightedRowIndex].classList.remove('mutual-highlight');
    this.contentRows[this.highlightedRowIndex].classList.remove('mutual-highlight');

    // if current row exists, highlight it
    if (currentRow) {
      const currentRowIndex = currentRow.rowIndex;
      /* set highlighted row index to current row index. this will be used to find the previous rows next time
      this function is called */
      this.highlightedRowIndex = currentRowIndex;
      this.lockedRows[currentRowIndex].classList.add('mutual-highlight');
      this.contentRows[currentRowIndex].classList.add('mutual-highlight');
    }
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

  getFieldValue(dataItem: any, subColumn: SubColumn, groupCellDataMapName: string) {
    let fieldValue: any = 0;

    // if mapping is an array, aggregate field values based off array values
    // otherwise, just use the field value from the mapping
    if (Array.isArray(subColumn.Mapping)) {
      for (const map of subColumn.Mapping) {
        fieldValue += this.getMapValue(dataItem[map]);
      }
    } else {
      fieldValue = this.getMapValue(dataItem[subColumn.Mapping]);
    }

    /* if span has transactions, has include zeroes stamped in the mapping,
    and is value 0, show blank instead */
    /* if sub column name if FILE_SOURCE or QHP_ID and value is 0, show blank too*/
    if (fieldValue === 0 &&
      (!dataItem[`HasTransactions`] && !subColumn[`IncludeZeroes`] ||
      subColumn.Name === 'FILE_SOURCE' ||
      subColumn.Name === 'QHP_ID')
    ) {
      fieldValue = '';
    }

    // if span is awkward, show dashes instead
    if (dataItem[`Awkward`] && subColumn[`IncludeZeroes`]) {
      fieldValue = '-';
    }

    // set cell data to map
    this.groupCellDataMap.set(`${groupCellDataMapName}`, this.getConvertedFieldValue(fieldValue));

    return fieldValue;
  }

  getMapValue(mapValue: any) {
    // if mapValue is truthy or is 0, return the mapValue, otherwise, return null
    return (mapValue || mapValue === 0) ? mapValue : 0;
  }

  getConvertedFieldValue(fieldValue: number | string) {
    // if fieldValue is a number, format it to US currency
    if (typeof(fieldValue) === 'number') {
      const currencyPrefix = fieldValue >= 0 ? '$' : '-$';
      return `${currencyPrefix}${Math.abs(fieldValue).toFixed(2)}`;
    }

    // otherwise, just return fieldValue
    return fieldValue;
  }

  getSummaryValue(group: GroupResult, subColumn: SubColumn, groupCellDataMapName: string) {
    // summary will always be first in group array
    if (Array.isArray(group.items) && group.items.length > 0) {
      return this.getFieldValue(group.items[0], subColumn, groupCellDataMapName);
    }

    return null;
  }

  getGroupCellClasses(index: number, group: GroupResult, columnName: string, subColumn: SubColumn) {
    const groupCellDataMapName = `${group.value}${columnName}${subColumn.Name}`;
    // these are classes to add specific styles to group cells based on conditions below
    const classes = {
      'initial-sub-column-cell': index === 0,
      'number-cell': typeof(this.getSummaryValue(group, subColumn, groupCellDataMapName)) === 'number',
      'primary-group': group.field === 'blngStmtDt',
      'secondary-group': group.field === 'billPeriodSpan'
    };

    // set group cell classes to map
    this.groupCellDataMap.set(`${groupCellDataMapName}GroupCellClasses`, classes);

    return classes;
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

      // adding mapping for static column (Type)
      if (column.Name.toLowerCase() === 'details') {
        column.SubHeader.unshift({
          Name: 'TxnType',
          Label: 'Type',
          Mapping: 'TxnType'
        });
      }

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
      this.resetGridData();
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
    this.resetGridData();
    this.onSortChange(sort);
  }

  toggleGroup(groupIndex: string, groupEvent: any, expanded: boolean) {
    if (expanded) {
      this.accountBillingPeriodsGrid.collapseGroup(groupIndex);
    } else {
      this.accountBillingPeriodsGrid.expandGroup(groupIndex);
      this.onGroupExpand(groupIndex, groupEvent);
    }
  }

  onGroupExpand(groupIndex: string, groupEvent: any) {
    const group = groupEvent.items[0];

    // if group hasn't been expanded yet, make call to backend to grab transactions
    if (!this.periodSpanExpandedMap.get(groupIndex)) {
      this.gridLoading = true;
      this.billingPeriodsService
        .getTransactions(group.BlngPerSpanSk, group.blngStmtDt, group.billPeriodSpan).subscribe((response) => {
          /* add group index to map so next time this group gets expanded, it doesn't have to call the
          backend again since the transactions have already been loaded */
          this.periodSpanExpandedMap.set(groupIndex, true);
          // add the transactions to the grid and regroup
          this.processGridData(response.data);
          }, (error) => {
          this.accountBillingPeriodsGrid.collapseGroup(groupIndex);
          this.alertsService.showErrorSnackbar(error);
          this.gridLoading = false;
        }
      );
    }
  }

  toggleVoidedRows() {
    this.includeVoidedRows = !this.includeVoidedRows;
    this.restartRowId = '0';
    this.resetGridData();
    this.loadGridData();
  }
}
