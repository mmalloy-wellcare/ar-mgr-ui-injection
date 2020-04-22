import { GridComponent, AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { Overlay } from '@angular/cdk/overlay';
import { ViewContainerRef, ViewChild } from '@angular/core';
import { Column } from '@app/models/column.model';
import { TemplatePortal } from '@angular/cdk/portal';

export abstract class ToggleableColumnsGridComponent extends GridComponent {
  @ViewChild('columnsDropdownTemplate', { static: false}) columnsDropdownTemplate;
  @ViewChild('columnsDropdownButton', { static: false}) columnsDropdownButton;
  columns: Array<Column> = [];
  columnsDropdownShown: boolean;

  constructor(
    public sortService: SortService,
    public alertsService: AlertsService,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef
  ) {
    super(sortService, alertsService);
  }

  onColumnSelectionChange(columns: Array<Column>) {
    this.columns = columns;
  }

  isHiddenColumn(field: string, parent?: string, childColumns?: Array<Column>) {
    let hidden: boolean;
    const columns = childColumns || this.columns;

    for (const column of columns) {
      // if column's field matches inputted field string, return hidden based off column's hidden value (Parent Column)
      if (column.field === field) {
        hidden = column.hidden;
        break;
      // else if column's field matches inputted parent string, look at its children
      // if child matches inputted field string, then return hidden based off column's hidden value (Child Column)
      } else if (column.field === parent) {
        hidden = this.isHiddenColumn(field, null, column.children);
        break;
      }
    }

    return hidden;
  }

  toggleColumnGroup(groupName: string, children?: Array<Column>, childStatus?: boolean) {
    const columnGroup = children || this.columns;

    for (const column of columnGroup) {
      // if column is a child, set value based on childStatus, otherwise set value based on toggled hidden value
      const columnStatus = groupName === 'children' ? !!childStatus : !column.hidden;

      // if column is a child or if groupName matches, set column's hidden value based on columnStatus from above
      if (groupName === 'children' || groupName === column.field) {
        column.hidden = column.default ? column.hidden : columnStatus;

        // if column has children, set childern's hidden value based on parent's
        if (column.children) {
          this.toggleColumnGroup('children', column.children, column.hidden);
        }
      }
    }
  }

  showColumnsDropdown() {
    // get columns button (#columnsDropdownButton)
    const columnsDropdownButton = this.columnsDropdownButton._elementRef.nativeElement;

    // create overlay
    const overlayRef = this.overlay.create({
      maxHeight: 400,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      // set dropdown position to columns button
      positionStrategy: this.overlay.position().flexibleConnectedTo(columnsDropdownButton)
        .withPositions([{
          // position to end and bottom of columns dropdown button
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }]),
      // reposition dropdown on scroll
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    // get columns dropdown template
    // template portal represents embedded template (#columnsDropdownTemplate)
    const columnsDropdown = new TemplatePortal(this.columnsDropdownTemplate, this.viewContainerRef);

    // attach columns dropdown to overlay
    overlayRef.attach(columnsDropdown);
    this.columnsDropdownShown = true;

    // subscribe to backdropClick so when user clicks outside dropdown, it closes
    overlayRef.backdropClick().subscribe(() => {
      this.columnsDropdownShown = false;
      overlayRef.dispose();
    });
  }
}

