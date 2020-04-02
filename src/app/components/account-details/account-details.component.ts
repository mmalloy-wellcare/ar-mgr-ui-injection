import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountsService } from '@app/services/accounts.service';
import { AlertsService } from '@nextgen/web-care-portal-core-library';

@Component({
  selector: 'pb-ar-ui-account-details',
  templateUrl: './account-details.component.html'
})
export class AccountDetailsComponent implements OnInit {
  @HostBinding('class') componentClass = 'web-component-flex side-padding';
  subscriberId: number;
  accountData: any = {};

  constructor(
    private route: ActivatedRoute,
    private accountsService: AccountsService,
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params) => {
      // grab subscriber id for use in making the call to get account data
      this.subscriberId = params.subscriberId;
    });
  }

  ngOnInit() {
    this.accountsService.getAccountById(this.subscriberId).subscribe((account) => {
      this.accountData = account || {};
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
    });
  }
}
