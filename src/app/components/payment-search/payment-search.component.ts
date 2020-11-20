import { Component,  HostBinding} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GemsService, GemsAuth } from 'gems-core';

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

  constructor(private gemsService: GemsService) { }

  public gemsAuthPaymentView: GemsAuth = {
    accessType: this.gemsService.READ,
    componentId: 'search-payment-view'
  };

  public gemsAuthPaymentSearch: GemsAuth = {
    accessType: this.gemsService.UPDATE,
    componentId: 'search-payment-search'
  };

  toggleSearchCard() {
    this.expandSearchCard = !this.expandSearchCard;
  }
}
