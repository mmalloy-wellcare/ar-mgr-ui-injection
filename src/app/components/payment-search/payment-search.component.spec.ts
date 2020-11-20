import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PaymentSearchComponent } from './payment-search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GemsAuthorizedDirective } from 'gems-core';
import { GemsService } from 'gems-core';
import { AlertsService } from '@nextgen/web-care-portal-core-library';

describe('PaymentSearchComponent', () => {
  let component: PaymentSearchComponent;
  let fixture: ComponentFixture<PaymentSearchComponent>;
  let gemsService: GemsService;
  const alertsService: Partial<AlertsService> = {
    showErrorSnackbar() {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSearchComponent, GemsAuthorizedDirective ],
      imports: [HttpClientTestingModule],
      providers: [
        GemsService,
        HttpClientTestingModule,
        {
          provide: AlertsService,
          useValue: alertsService
        }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    gemsService = TestBed.get(GemsService);
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
