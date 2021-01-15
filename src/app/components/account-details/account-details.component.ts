import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountsService } from '@app/services/accounts.service';
import { AlertsService } from '@nextgen/web-care-portal-core-library';

@Component({
  selector: 'ar-mgr-ui-account-details',
  templateUrl: './account-details.component.html'
})
export class AccountDetailsComponent implements OnInit {
  @HostBinding('class') componentClass = 'web-component-flex side-padding';
  subscriberId: number;
  accountData: any = {
    AccountName: '---'
  };
  loadedTabsMap = new Map();

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
    // add index 1 to map on init since the second tab starts out as shown
    this.loadedTabsMap.set(1, true);

    this.accountsService.getAccountById(this.subscriberId).subscribe((account) => {
      this.accountData = account || {};
    }, (error) => {
      this.alertsService.showErrorSnackbar(error);
    });
  }

  onSelectedIndexChange(index: number) {

    if (this.loadedTabsMap.has(3)) {
      this.loadedTabsMap.delete(3);
    }
    /**
     * Right now, all components inside all tabs initialize when the screen loads.
     * We only want to initialize them when the tab is clicked.
     * To do this, the tab will check if it has already been clicked (index is in map).
     * If the tab hasn't been clicked (index is not in map), set the index to map on selected index change.
     * Once the index has been set to map, the component will be inialized and displayed.
     */
    if (!this.loadedTabsMap.has(index)) {
      this.loadedTabsMap.set(index, true);
    }

  }
}
