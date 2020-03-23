import { Component, HostBinding, Input } from '@angular/core';
import { Dependent } from 'src/app/models/dependent.model';

@Component({
  selector: 'pb-ar-ui-account-dependent',
  templateUrl: './account-dependent.component.html'
})
export class AccountDependentComponent {
  @HostBinding('class') componentClass = 'detail-card';
  @Input() dependents: Array<Dependent> = [];

  constructor() { }
}
