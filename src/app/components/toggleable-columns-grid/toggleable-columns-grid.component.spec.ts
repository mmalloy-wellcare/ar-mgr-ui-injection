import { async, TestBed, inject } from '@angular/core/testing';

import { ToggleableColumnsGridComponent } from './toggleable-columns-grid.component';
import { SortService, AlertsService } from '@nextgen/web-care-portal-core-library';
import { Overlay } from '@angular/cdk/overlay';
import { ViewContainerRef } from '@angular/core';
import { Column } from '@app/models/column.model';
import { of } from 'rxjs';

class TestClass extends ToggleableColumnsGridComponent {}

describe('ToggleableColumnsGridComponent', () => {
  let component: TestClass;
  const sortService: Partial<SortService> = {
    convertSort() {
      return {};
    }
  };
  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {}
  };
  const mockColumns = [{
    field: 'TEST_COLUMN',
    title: 'Test Column',
    hidden: false,
    children: [{
      field: 'CHILD_COLUMN',
      title: 'Child Column',
      hidden: false
    }, {
      field: 'CHILD_COLUMN_DEFAULT',
      title: 'Child Column Default',
      hidden: false,
      default: true
    }]
  }, {
    field: 'NO_CHILDREN_COLUMN',
    title: 'No Children Column',
    hidden: true
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: SortService,
        useValue: sortService
      }, {
        provide: AlertsService,
        useValue: alertsService
      },
      Overlay,
      ViewContainerRef
    ]
    })
    .compileComponents();
  }));

  beforeEach(inject(
    [AlertsService, SortService, Overlay, ViewContainerRef],
    (alertsServiceInject, sortServiceInject, overlayInject, viewContainerRefInject) => {
      component = new TestClass(sortServiceInject, alertsServiceInject, overlayInject, viewContainerRefInject);
      component.columns = mockColumns;
    }
  ));

  describe('showCustomDropdown', () => {
    it('should create overlay with dropdown when trigger element is clicked', () => {
      testShowCustomDropdown(true);
    });

    it('should create overlay with dropdown when inner element of trigger element is clicked', () => {
      testShowCustomDropdown(false);
    });

    function testShowCustomDropdown(triggerElement: boolean) {
      const overlayRef = jasmine.createSpyObj({
        backdropClick: of({}),
        dispose() {},
        attach() {}
      });
      const mockButton = document.createElement('button');
      const mockChildNode = document.createElement('span');
      mockButton.classList.add('custom-dropdown-trigger');
      mockButton.appendChild(mockChildNode);

      spyOn(component.overlay, 'create').and.returnValue(overlayRef);
      component.showCustomDropdown(
        triggerElement ? mockButton : mockButton.firstChild as HTMLElement,
        component.columnsDropdownTemplate
      );
      expect(component.overlay.create).toHaveBeenCalled();
    }
  });

  describe('onColumnSelectionChange', () => {
    it('should set columns with new columns', () => {
      component.onColumnSelectionChange(mockColumns);
      expect(component.columns).toEqual(mockColumns);
    });
  });

  describe('toggleColumnGroup', () => {
    it('should toggle hide/show for parent column and its children', () => {
      component.toggleColumnGroup('TEST_COLUMN');
      testColumnStatus(component.columns, true);
    });

    function testColumnStatus(columns: Array<Column>, expectedStatus: boolean) {
      for (const column of columns) {
        expect(column.hidden).toEqual(column.default ? !expectedStatus : expectedStatus);

        if (column.children) {
          testColumnStatus(column.children, expectedStatus);
        }
      }
    }
  });
});
