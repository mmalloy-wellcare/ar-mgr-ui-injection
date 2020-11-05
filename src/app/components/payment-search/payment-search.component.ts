import { Component, OnInit,  HostBinding} from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'ar-mgr-ui-payment-search',
  templateUrl: './payment-search.component.html'
})
export class PaymentSearchComponent {
  @HostBinding('class') componentClass = 'web-component-flex side-padding';
  expandSearchCard = true;
  paymentSearchForm: FormGroup = new FormGroup({

  });

  constructor() { }

  toggleSearchCard() {
    this.expandSearchCard = !this.expandSearchCard;
  }
}
