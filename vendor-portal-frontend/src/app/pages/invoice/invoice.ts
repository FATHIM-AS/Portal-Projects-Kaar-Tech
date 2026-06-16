import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Location } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-invoice',
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css']
})
export class InvoiceComponent implements OnInit {

  invoices: any[] = [];
  loading = true;
  searchText = '';

  showYear = false;
  showDueDate = false;
  showAmount = false;
  showAging = false;
  showStatus = false;

  constructor(
    private api: ApiService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;

    this.api.getInvoice().subscribe({
      next: (res: any) => {

        console.log("INVOICE RESPONSE:", res);

        if (res.success) {

          this.invoices = (res.data || []).map((inv: any) => ({

            Belnr: inv.Belnr,
            Gjahr: inv.Gjahr,
            Bldat: this.formatDate(inv.Bldat),

            Amount: inv.Wrbtr,

            Waers: inv.Waers,
            Zfbdt: inv.Zfbdt,
            AgingDays: inv.AgingDays,
            Status: inv.Status

          }));

          this.showYear = this.invoices.some(i => i.Gjahr);
          this.showDueDate = this.invoices.some(i => i.Zfbdt);
          this.showAmount = this.invoices.some(i => i.Amount);
          this.showAging = this.invoices.some(i => i.AgingDays);
          this.showStatus = this.invoices.some(i => i.Status);

        } else {
          this.invoices = [];
        }

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error("ERROR:", err);
        this.invoices = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredInvoices() {
    return this.invoices.filter(inv =>
      !this.searchText ||
      inv.Belnr?.toString().includes(this.searchText)
    );
  }

  viewPdf(belnr: string) {
    const url = this.api.getInvoicePdf(belnr);
    window.open(url, '_blank');
  }

  goBack() {
    this.location.back();
  }

  formatDate(sapDate: string): string {
    if (!sapDate) return '';

    const match = sapDate.match(/\d+/);
    if (!match) return sapDate;

    return new Date(Number(match[0])).toLocaleDateString();
  }
}