import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'pb-ar-ui-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent {
  @HostBinding('class') componentClass = 'web-component-flex side-padding';
  accountName = 'All Accounts';

  constructor() {}
}
