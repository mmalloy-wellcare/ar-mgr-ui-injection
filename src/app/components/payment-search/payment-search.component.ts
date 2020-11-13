import { Component,  HostBinding} from '@angular/core';
import { FormGroup } from '@angular/forms';

// TODO: Create base search component so code is not duplicate
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
