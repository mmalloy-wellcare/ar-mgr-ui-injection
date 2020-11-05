import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PaymentSearchComponent } from './payment-search.component';

describe('PaymentSearchComponent', () => {
  let component: PaymentSearchComponent;
  let fixture: ComponentFixture<PaymentSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSearchComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expand search box', () => {
    component.expandSearchCard = false;
    component.toggleSearchCard();
    expect(component.expandSearchCard).toEqual(true);
  });
});
