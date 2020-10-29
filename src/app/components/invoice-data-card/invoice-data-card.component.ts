import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';

@Component({
  selector: 'ar-mgr-ui-invoice-data-card',
  templateUrl: './invoice-data-card.component.html',
  styleUrls: ['./invoice-data-card.component.scss']
})
export class InvoiceDataCardComponent implements OnInit {
  @Input() invoices;
  moreDetails = [];

  constructor(
    private changeDectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.invoices.Invoices.forEach(() => {
      this.moreDetails.push({
        details: false,
        notes: false
      });
    });
  }

  openDetails(index) {
    this.moreDetails[index].details = !this.moreDetails[index].details;
    this.changeDectorRef.detectChanges();
  }

  openNotes(index) {
    this.moreDetails[index].notes = !this.moreDetails[index].notes;
    this.changeDectorRef.detectChanges();
  }
}
