import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { Column } from 'src/app/models/column.model';

@Component({
  selector: 'ar-mgr-ui-column-selection',
  templateUrl: './column-selection.component.html'
})
export class ColumnSelectionComponent {
  @HostBinding('class') classes = 'ar-mgr-ui-checkbox-dropdown checkbox-group-vertical';
  @Input() columns: Array<Column>;
  @Input() columnsToggle: boolean;
  @Input() showColumnsText: string;
  @Input() hideColumnsText: string;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  updateParentColumns(checked: boolean, field: string, parentOnly?: boolean) {
    for (const column of this.columns) {
      // if column's field matches inputted field string and selection is not default, set hidden
      if (column.field === field && !column.default) {
        column.hidden = !checked;
        // if there are any children, update child selection's values to that of the parent
        this.updateChildColumns(!column.hidden, 'all', column.children, parentOnly);
        break;
      }
    }

    // emit changes to column
    this.selectionChange.emit(this.columns);
  }

  updateChildColumns(checked: boolean, field: string, childrenColumns: Array<Column>, parentOnly?: boolean, parent?: string) {
    let childrenChecked = 0;

    // if there are children columns and not parent, update children
    if (!parentOnly && childrenColumns) {
      for (const column of childrenColumns) {
        // field is all or matches and is not default column, set column's hidden value
        if ((field === 'all' || field === column.field) && !column.default) {
          column.hidden = !checked;
        }
        childrenChecked += (!column.hidden && !column.default) ? 1 : 0;
      }

      // if there is at least one child checked or if there are no children checked, update parent to be checked or not
      this.updateParentColumns(!!childrenChecked, parent, true);
    }
  }

  toggleColumns(action: string) {
    for (const column of this.columns) {
      // if column is not default, hide or show based off inputted action string
      if (!column.default) {
        column.hidden = action === 'collapse' ? true : false;
        this.updateChildColumns(!column.hidden, 'all', column.children);
      }
    }
  }
}
