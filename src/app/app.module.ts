import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, DoBootstrap, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { createCustomElement } from '@angular/elements';
import { EmptyModule, AlertsService, SortService, BreadcrumbsModule } from '@nextgen/web-care-portal-core-library';
import { GridModule } from '@progress/kendo-angular-grid';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivityComponent } from './components/activity/activity.component';
import { BillingPeriodsService } from './services/billing-periods.service';
import { HttpClientModule } from '@angular/common/http';
import { AccountSearchComponent } from './components/account-search/account-search.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { AccountResultsComponent } from './components/account-results/account-results.component';
import { ColumnSelectionComponent } from './components/column-selection/column-selection.component';
import { AccountDependentComponent } from './components/account-dependent/account-dependent.component';
import { NgxMaskModule } from 'ngx-mask';
import { BillPeriodFilterComponent } from './components/bill-period-filter/bill-period-filter.component';
import { InvoiceSearchComponent } from './components/invoice-search/invoice-search.component';
import { InvoiceDataCardComponent } from './components/invoice-data-card/invoice-data-card.component';
import { InvoiceDetailsComponent } from './components/invoice-details/invoice-details.component';
import { InvoiceService } from './services/invoice.service';
import { PaymentSearchComponent } from './components/payment-search/payment-search.component';
import { PaymentDetailsComponent } from './components/payment-details/payment-details.component';
import { PaymentsService } from './services/payments.service';

@NgModule({
  declarations: [
    AppComponent,
    AccountDetailsComponent,
    ActivityComponent,
    AccountSearchComponent,
    AccountResultsComponent,
    ColumnSelectionComponent,
    AccountDependentComponent,
    BillPeriodFilterComponent,
    InvoiceSearchComponent,
    InvoiceDataCardComponent,
    InvoiceDetailsComponent,
    PaymentSearchComponent,
    PaymentDetailsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    EmptyModule,
    AppRoutingModule,
    GridModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbsModule,
    NgxMaskModule.forRoot()
  ],
  providers: [
    AlertsService,
    SortService,
    BillingPeriodsService,
    InvoiceService,
    PaymentsService
  ],
  bootstrap: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [AppComponent]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const applicationWebComponent = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('ar-mgr-ui', applicationWebComponent);
  }
}
