import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementRequestsComponent } from './reimbursement-requests.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ReimbursementRequestsComponent', () => {
  let component: ReimbursementRequestsComponent;
  let fixture: ComponentFixture<ReimbursementRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReimbursementRequestsComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReimbursementRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
