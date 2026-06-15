import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrls: ['./finance.css']
})
export class FinanceComponent implements OnInit {

  private service = inject<CustomerService>(CustomerService);
  private location = inject(Location);

  viewMode: string = '';

  aging: any[] = [];
  creditDebit: any[] = [];
  invoice: any[] = [];

  filteredAging: any[] = [];
  filteredCredit: any[] = [];
  filteredInvoice: any[] = [];

  currencies: string[] = [];
  invoiceCurrencies: string[] = [];

  selectedCurrency = '';
  selectedType = '';
  selectedInvoiceCurrency = '';

  searchAging = '';
  searchCredit = '';
  searchInvoice = '';

  totalAmount = 0;

  ngOnInit() {
    const customerId = localStorage.getItem('customerId') || '0000000002';
    this.loadData(customerId);
  }

  loadData(customerId: string) {
    this.service.getFinance(customerId).subscribe(data => {

      this.aging = data.aging.map((a: any) => ({
        documentNumber: this.removeLeadingZeros(a.VBELN),       
        date: this.formatDate(a.FKDAT),
        amount: a.NETWR,
        currency: a.WAERK,
        agingDays: a.AGING_DAYS
      }));

      this.creditDebit = data.creditDebit.map((c: any) => ({
        documentNumber: this.removeLeadingZeros(c.BELNR),
        date: this.formatDate(c.BUDAT),
        amount: c.WRBTR,
        type: c.SHKZG === 'S' ? 'Credit' : 'Debit'
      }));

      this.invoice = data.invoice.map((i: any) => ({
        invoiceNumber: this.removeLeadingZeros(i.VBELN),
        date: this.formatDate(i.FKDAT),
        amount: i.NETWR,
        currency: i.WAERK
      }));

      this.totalAmount = data.total;

      this.filteredAging = [...this.aging];
      this.filteredCredit = [...this.creditDebit];
      this.filteredInvoice = [...this.invoice];

      this.currencies = [...new Set(this.aging.map(a => a.currency))];
      this.invoiceCurrencies = [...new Set(this.invoice.map(i => i.currency))];
    });
  }

  applyAgingFilter() {
    this.filteredAging = this.aging.filter(a =>
      (!this.selectedCurrency || a.currency === this.selectedCurrency) &&
      (!this.searchAging || a.documentNumber.includes(this.searchAging))
    );
  }

  clearAgingFilter() {
    this.selectedCurrency = '';
    this.searchAging = '';
    this.filteredAging = [...this.aging];
  }

  applyCreditFilter() {
    this.filteredCredit = this.creditDebit.filter(c =>
      (!this.selectedType || c.type === this.selectedType) &&
      (!this.searchCredit || c.documentNumber.includes(this.searchCredit))
    );
  }

  clearCreditFilter() {
    this.selectedType = '';
    this.searchCredit = '';
    this.filteredCredit = [...this.creditDebit];
  }

  applyInvoiceFilter() {
    this.filteredInvoice = this.invoice.filter(i =>
      (!this.selectedInvoiceCurrency || i.currency === this.selectedInvoiceCurrency) &&
      (!this.searchInvoice || i.invoiceNumber.includes(this.searchInvoice))
    );
  }

  clearInvoiceFilter() {
    this.selectedInvoiceCurrency = '';
    this.searchInvoice = '';
    this.filteredInvoice = [...this.invoice];
  }

  viewPDF(invoiceNumber: string) {
    window.open(`http://localhost:3000/invoice/${invoiceNumber}`, '_blank');
  }

  formatDate(date: string): string {
    if (!date || date === '0000-00-00') return '-';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1)
      .toString().padStart(2,'0')}-${d.getFullYear()}`;
  }
  removeLeadingZeros(value: any): string {
  if (!value || value === '-') return '-';
  return String(value).replace(/^0+/, '') || '0';
}

  goBack(): void {
    this.location.back();
  }
}