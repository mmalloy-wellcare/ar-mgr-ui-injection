import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDependentComponent } from './account-dependent.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AccountDependentComponent', () => {
  let component: AccountDependentComponent;
  let fixture: ComponentFixture<AccountDependentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountDependentComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDependentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
