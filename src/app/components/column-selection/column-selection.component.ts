import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { Column } from 'src/app/models/column.model';

@Component({
  selector: 'pb-ar-ui-column-selection',
  templateUrl: './column-selection.component.html'
})
export class ColumnSelectionComponent {
  @HostBinding('class') classes = 'pb-ar-ui-checkbox-dropdown checkbox-group-vertical';
  @Input() columns: Array<Column>;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  onColumnSelectionChange(checked: boolean, field: string) {
    for (const column of this.columns) {
      if (column.field === field) {
        column.hidden = !checked;
        break;
      }
    }

    this.selectionChange.emit(this.columns);
  }
}
