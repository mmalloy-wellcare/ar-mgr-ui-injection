import { Component, ViewEncapsulation, HostBinding } from '@angular/core';

@Component({
  selector: 'pb-ar-ui',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  @HostBinding('class') appComponentClass = 'flex-column';
}
