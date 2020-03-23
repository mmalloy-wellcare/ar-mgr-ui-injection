import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnSelectionComponent } from './column-selection.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import mockColumns from '../account-results/account-results-columns.json';

describe('ColumnSelectionComponent', () => {
  let component: ColumnSelectionComponent;
  let fixture: ComponentFixture<ColumnSelectionComponent>;

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
    component.columns = mockColumns;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onColumnSelectionChange', () => {
    it('should set column to hidden', () => {
      const mockColumn = component.columns[1];
      mockColumn.hidden = false;

      component.onColumnSelectionChange(false, mockColumn.field);
      expect(mockColumn.hidden).toEqual(true);
    });
  });
});
