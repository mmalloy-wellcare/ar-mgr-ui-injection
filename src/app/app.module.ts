import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, DoBootstrap, Injector } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { createCustomElement } from '@angular/elements';
import { EmptyModule, AlertsService, SortService } from '@nextgen/web-care-portal-core-library';
import { GridModule } from '@progress/kendo-angular-grid';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { TransactionsService } from './services/transactions.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    AccountDetailsComponent,
    TransactionsComponent
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
    HttpClientModule
  ],
  providers: [
    AlertsService,
    SortService,
    TransactionsService
  ],
  bootstrap: [],
  entryComponents: [AppComponent]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const applicationWebComponent = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('pb-ar-ui', applicationWebComponent);
  }
}
