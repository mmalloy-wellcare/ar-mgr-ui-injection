import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationService, EmptyComponent } from '@nextgen/web-care-portal-core-library';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { AccountSearchComponent } from './components/account-search/account-search.component';
import { ReimbursementRequestsComponent } from './components/reimbursement-requests/reimbursement-requests.component';

const routes: Routes = [{
  path: 'ar-mgr-ui/account-search',
  component: AccountSearchComponent
}, {
  path: 'ar-mgr-ui/account-search/details/:subscriberId',
  component: AccountDetailsComponent
},  {
  path: 'ar-mgr-ui/reimbursement-requests',
  component: ReimbursementRequestsComponent
}, {
  path: '**',
  component: EmptyComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: ConfigurationService.configurationServiceFactory,
    deps: [Injector],
    multi: true
  }]
})
export class AppRoutingModule { }
