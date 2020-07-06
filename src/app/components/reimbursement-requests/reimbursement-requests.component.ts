import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'ar-mgr-ui-reimbursement-requests',
  templateUrl: './reimbursement-requests.component.html'
})
export class ReimbursementRequestsComponent {
  @HostBinding('class') componentClass = 'web-component-flex side-padding';

  constructor() { }
}
