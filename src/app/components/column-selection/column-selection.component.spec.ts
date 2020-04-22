import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnSelectionComponent } from './column-selection.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Column } from '@app/models/column.model';
import mockColumns from '../activity/activity-columns.json';

describe('ColumnSelectionComponent', () => {
  let component: ColumnSelectionComponent;
  let fixture: ComponentFixture<ColumnSelectionComponent>;
  const mockDefaultParentColumn = [{
    field: 'DEFAULT_PARENT',
    title: 'Default Parent',
    hidden: false,
    default: true
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColumnSelectionComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnSelectionComponent);
    component = fixture.componentInstance;
    component.columns = [...mockColumns, ...mockDefaultParentColumn];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateParentColumns', () => {
    it('should set hidden to TRUE if parent selection is NOT CHECKED', () => {
      component.updateParentColumns(false, 'TRANSACTION_DATES');
      testUpdateColumns('TRANSACTION_DATES', component.columns, true);
    });

    it('should set hidden to FALSE if parent selection is CHECKED', () => {
      component.updateParentColumns(true, 'TRANSACTION_DATES');
      testUpdateColumns('TRANSACTION_DATES', component.columns, false);
    });

    it('should set hidden to TRUE if child selection is NOT CHECKED', () => {
      component.updateChildColumns(false, 'billPeriodSpan', component.columns[0].children, false, 'TRANSACTION_DATES');
      testUpdateColumns('billPeriodSpan', component.columns[0].children, true);
    });

    it('should set hidden to FALSE if child selection is CHECKED', () => {
      component.updateChildColumns(true, 'billPeriodSpan', component.columns[0].children, false, 'TRANSACTION_DATES');
      testUpdateColumns('billPeriodSpan', component.columns[0].children, false);
    });

    function testUpdateColumns(fieldName: string, columns: Array<Column>, expectedStatus: boolean) {
      for (const column of columns) {
        if (fieldName === column.field) {
          expect(column.hidden).toEqual(expectedStatus);
          break;
        }
      }
    }
  });

  describe('toggleColumns', () => {
    it('should set hidden for all columns to true', () => {
      testToggleColumns('collapse', true);
    });

    it('should set hidden for all columns to false', () => {
      testToggleColumns('expand', false);
    });

    function testToggleColumns(action: string, expectedStatus: boolean) {
      component.toggleColumns(action);
      for (const column of component.columns) {
        if (!column.default) {
          expect(column.hidden).toEqual(expectedStatus);
        }
      }
    }
  });
});
