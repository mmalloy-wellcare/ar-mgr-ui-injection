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
  highlightedRowIndex = 0;
  lockedRows: HTMLCollectionOf<HTMLTableRowElement>;
  contentRows: HTMLCollectionOf<HTMLTableRowElement>;

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
        this.saveGridRows();
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
      this.resetGrid();
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
    this.resetGrid();
    this.onSortChange(sort);
  }

  resetGrid() {
    this.gridData = [];
    this.gridView = null;
    this.highlightedRowIndex = 0;
  }
}
