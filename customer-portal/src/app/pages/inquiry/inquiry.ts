import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquiry.html',
  styleUrls: ['./inquiry.css']
})
export class InquiryComponent implements OnInit {

  private service = inject<CustomerService>(CustomerService);
  private cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private location = inject(Location);
  inquiries: any[] = [];
  filteredInquiries: any[] = [];
  statuses: string[] = [];
  selectedStatus: string = 'ALL';
  searchInquiryNumber: string = '';
  loading: boolean = true;

  // Unit abbreviation → full form mapping
  private unitMap: { [key: string]: string } = {
    'EA': 'Each',
    'IN': 'Inch',
    'FT': 'Feet',
    'MT': 'Meter',
    'CM': 'Centimeter',
    'MM': 'Millimeter',
    'KG': 'Kilogram',
    'G':  'Gram',
    'LB': 'Pound',
    'OZ': 'Ounce',
    'L':  'Litre',
    'ML': 'Millilitre',
    'M':  'Meter',
    'PC': 'Piece',
    'PR': 'Pair',
    'PK': 'Pack',
    'BX': 'Box',
    'CS': 'Case',
    'ST': 'Set',
    'RL': 'Roll',
    'DZ': 'Dozen'
  };

  ngOnInit(): void {
    console.log(" INQUIRY INIT");

    let customerId = localStorage.getItem('customerId');

    console.log(" RAW customerId from localStorage:", customerId);

    if (!customerId) {
      console.warn(" No customerId in localStorage");
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    customerId = customerId.padStart(10, '0');
    console.log(" PADDED customerId:", customerId);

    this.service.getInquiries(customerId).subscribe({
      next: (data: any[]) => {
        console.log(' INQUIRY API DATA:', data);

        if (!data || data.length === 0) {
          console.warn(" Empty data returned");
          this.filteredInquiries = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.inquiries = data.map(item => ({
          inquiryNumber: this.removeLeadingZeros(item.inquiryNumber)|| '-',
          date:          item.date          || '-',
          material:      item.material      || '-',
          description:   item.description   || '-',
          quantity:      item.quantity      || '-',
          unit:          item.unit          || '-',
          status:        item.status        || '-',
          deliveryDate:  item.deliveryDate  || '-'
        }));

        this.statuses = Array.from(
          new Set(this.inquiries.map(d => d.status).filter(s => s && s !== '-'))
        );

        this.selectedStatus = 'ALL';
        this.searchInquiryNumber = '';
        this.filteredInquiries = [...this.inquiries];

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(" INQUIRY ERROR:", err);
        this.filteredInquiries = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.filteredInquiries = this.inquiries.filter(i => {
      const statusMatch = this.selectedStatus === 'ALL' || i.status === this.selectedStatus;
      const searchTerm = this.searchInquiryNumber.trim().toLowerCase();
      const searchMatch = !searchTerm || i.inquiryNumber.toLowerCase().includes(searchTerm);
      return statusMatch && searchMatch;
    });
    this.cdr.detectChanges();
  }
goBack(): void {
  this.location.back();
}
  clearFilters() {
    this.selectedStatus = 'ALL';
    this.searchInquiryNumber = '';
    this.filteredInquiries = [...this.inquiries];
    this.cdr.detectChanges();
  }

  getStatusText(status: string): string {
    return status || '-';
  }

  getUnitFullForm(unit: string): string {
    if (!unit || unit === '-') return '-';
    const upper = unit.toUpperCase();
    return this.unitMap[upper] || unit; // fallback to original if not in map
  }

  formatDate(date: string): string {
    if (!date || date === '0000-00-00') return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB');
  }
  removeLeadingZeros(value: any): string {
  if (!value || value === '-') return '-';
  return String(value).replace(/^0+/, '') || '0';
}
}