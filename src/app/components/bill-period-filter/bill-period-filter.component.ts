import { Component, OnInit, Input, HostBinding, EventEmitter, Output } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Filter } from '@nextgen/web-care-portal-core-library';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'pb-ar-ui-bill-period-filter',
  templateUrl: './bill-period-filter.component.html'
})
export class BillPeriodFilterComponent implements OnInit {
  @HostBinding('class') classes = 'pb-ar-ui-checkbox-dropdown bill-period-filter';
  @Input() billPeriodYears: Array<any> = [];
  @Input() currentFilter: Array<Filter> = [];
  @Input() defaultFilter: Array<Filter> = [];
  @Input() filterProperty: string;
  @Output() filterChange: EventEmitter<string> = new EventEmitter<string>();
  yearControl: FormControl = new FormControl();
  availableYears: Array<any> = [];

  constructor() { }

  ngOnInit() {
    this.updateAvailableYears();

    // filter available year selection when a user types in the input field
    this.yearControl.valueChanges.pipe(debounceTime(500)).subscribe((filterYear) => {
      for (const availableYear of this.availableYears) {
        availableYear.hidden = true;
        if (availableYear.year.toString().startsWith(filterYear)) {
          availableYear.hidden = false;
        }
      }
    });
  }

  updateAvailableYears() {
    for (const year of this.billPeriodYears) {
      this.availableYears.push({
        year,
        filter: this.isFilteredYear(year),
        hidden: false
      });
    }
  }

  isFilteredYear(year: string) {
    let filterStatus = false;

    /* if there is a current filter, loop through the filter array and check
    if the year from the filter starts with the inputted year */
    if (this.currentFilter !== this.defaultFilter) {
      for (const filter of this.currentFilter) {
        if (filter.property === this.filterProperty && filter.value.startsWith(year)) {
          filterStatus = true;
          break;
        }
      }
    }

    return filterStatus;
  }

  getFilteredYears() {
    // return list of years that have filter set to true
    return this.availableYears.filter((availableYear) => {
      if (availableYear.filter) {
        return availableYear.year;
      }
    }).map((filteredYearObject) => {
      return +filteredYearObject.year;
    });
  }

  sendFilter(action: string) {
    /* Filter will only support filtering by one year at a time for now. API will be updated to include
    multi-year filtering */
    // TODO: Update this function to support multiple years when API is updated
    this.filterChange.emit(action === 'filter' ? `${this.getFilteredYears()[0]}` : undefined);
  }
}
