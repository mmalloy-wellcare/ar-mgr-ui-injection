import { Component, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { GridComponent, AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { BillingPeriodsService } from '@app/services/billing-periods.service';
import { DataResult, GroupDescriptor, process, GroupResult } from '@progress/kendo-data-query';
import { SelectableSettings, GridComponent as KendoGridComponent } from '@progress/kendo-angular-grid';
import { SubColumn } from '@app/models/subcolumn.model';

@Component({
  selector: 'pb-ar-ui-activity',
  templateUrl: './activity.component.html'
})
export class ActivityComponent extends GridComponent implements OnInit {
  @HostBinding('class') componentClass = 'web-component-flex';
  @ViewChild('accountBillingPeriodsGrid', { static: false }) accountBillingPeriodsGrid: KendoGridComponent;
  accountIdInput: string;
  @Input() set accountId(value: string) {
    if (value) {
      this.accountIdInput = value;
      this.loadGridData();
    }
  }
  get accountId() {
    return this.accountIdInput;
  }
  // using grid view instead of gridata to show groupings by bill period and period span
  gridView: DataResult;
  rowGroups: GroupDescriptor[] = [{
    field: 'BillPerDt'
  }, {
    field: 'billPeriodSpan'
  }];
  selectableSettings: SelectableSettings = {
    checkboxOnly: true,
    mode: 'single'
  };
  dynamicColumnGroups: Array<SubColumn> = [];

  constructor(
    public alertsService: AlertsService,
    public sortService: SortService,
    private billingPeriodsService: BillingPeriodsService
  ) {
    super(sortService, alertsService);
  }

  ngOnInit() {
    this.loadGridMetadata();
  }

  loadGridData() {
    const savedRestartRowId = this.restartRowId || '0';
    this.gridLoading = true;

    this.billingPeriodsService.getBillingPeriods(this.accountId, savedRestartRowId, this.convertedSort).subscribe(response => {
      this.gridData = this.gridData.concat(response.data);
      this.gridView = process(this.gridData, { group: this.rowGroups });
      this.updateGridRows();
      // there's no collapse all grouping method in kendo api, need to collapse children grouping manually by default
      this.collapsePeriodSpans(this.gridView.data);
      this.restartRowId = response.restartRowId;
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
    }, () => {
      this.gridLoading = false;
    });
  }

  loadGridMetadata() {
    // load meta data used in creating dynamic columns for grid
    // 'marketplace' is hardcoded for now until account api can pass back LOB
    this.billingPeriodsService.getBillingPeriodsMetadata('marketplace').subscribe((response) => {
      this.dynamicColumnGroups = response.data;
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
      let rowIndex = 0;

      // cannot use forEach on an html collection. using forOf instead
      for (const row of lockedRows) {
        const contentRow = contentRows[rowIndex];

        /* add mouseover and mouseleave listeners to locked and content rows so when a user hovers
        on a row, it hightlights both the locked table and content table's row, and when the user leaves
        it removes that higlight*/
        this.addMutualHoverEvents(contentRow, row);
        this.addMutualHoverEvents(row, contentRow);
        rowIndex++;
      }
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
}
