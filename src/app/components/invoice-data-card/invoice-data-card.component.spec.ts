import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceDataCardComponent } from './invoice-data-card.component';
import mockInvoices from '@mocks/ar-mgr/ar/list.of.invoices.json';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('InvoiceDataCardComponent', () => {
  let component: InvoiceDataCardComponent;
  let fixture: ComponentFixture<InvoiceDataCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDataCardComponent ],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDataCardComponent);
    component = fixture.componentInstance;

    component.invoices = mockInvoices[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the details', () => {
    component.openDetails(0);
    expect(component.moreDetails[0].details).toEqual(true);
  });

  it('should open the notes', () => {
    component.openNotes(0);
    expect(component.moreDetails[0].notes).toEqual(true);
  });
});
