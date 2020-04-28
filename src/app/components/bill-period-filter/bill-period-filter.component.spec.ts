import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { BillPeriodFilterComponent } from './bill-period-filter.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BillPeriodFilterComponent', () => {
  let component: BillPeriodFilterComponent;
  let fixture: ComponentFixture<BillPeriodFilterComponent>;
  const mockAvailableYears = [{
    year: 2018,
    filter: false,
    hidden: false
  }, {
    year: 2020,
    filter: true,
    hidden: false
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BillPeriodFilterComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillPeriodFilterComponent);
    component = fixture.componentInstance;
    component.filterProperty = 'blngStmtDt';
    component.availableYears = mockAvailableYears;
    component.currentFilter = [{
      operator: 'EQ',
      property: 'blngStmtDt',
      value: '1999',
      dataType: 'Date'
    }, {
      operator: 'EQ',
      property: 'blngStmtDt',
      value: '2020',
      dataType: 'Date'
    }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateAvailableUears', () => {
    it('should update availableYears based on billPeriodYears', () => {
      component.billPeriodYears = [2018, 2020];
      component.updateAvailableYears();
      expect(component.availableYears).toEqual(mockAvailableYears);
    });
  });

  describe('sendFilter', () => {
    it('should emit filterChange when filter button is clicked', () => {
      testUpdateFilter('filter');
    });

    it('should emit filterChange when clear button is clicked', () => {
      testUpdateFilter('clear');
    });

    function testUpdateFilter(action: string) {
      spyOn(component.filterChange, 'emit');
      component.sendFilter(action);
      expect(component.filterChange.emit).toHaveBeenCalled();
    }
  });

  describe('isFilteredYear', () => {
    it('should return false if current filter is equal to default filter', () => {
      component.currentFilter = component.defaultFilter;
      expect(component.isFilteredYear('1999')).toEqual(false);
    });

    it('should return true if current filter year matches year input', () => {
      expect(component.isFilteredYear('2020')).toEqual(true);
    });
  });

  describe('getFilteredYears', () => {
    it('should return filtered years', () => {
      component.availableYears = [{
        year: '1999',
        filter: true
      }];
      expect(component.getFilteredYears()).toEqual([1999]);
    });
  });

  describe('valueChanges', () => {
    it('should set hidden to false if value matches availableYear', fakeAsync(() => {
      component.availableYears[1].hidden = true;
      component.yearControl.setValue('2020');
      tick(500);
      expect(component.availableYears[1].hidden).toEqual(false);
    }));
  });
});
