import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Location } from '@angular/common';
@Component({
  standalone: true,
  selector: 'app-sales-order',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-order.html',
  styleUrls: ['./sales-order.css']
})
export class SalesOrderComponent implements OnInit {

  private service = inject<CustomerService>(CustomerService);
  private cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private location = inject(Location);
  orders: any[] = [];
  filteredOrders: any[] = [];
  statuses: string[] = [];
  selectedStatus: string = '';
  searchOrderNo: string = '';
  searchMaterial: string = '';
  isLoading: boolean = true;

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
    const customerId = localStorage.getItem('customerId');

    if (!customerId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.service.getSalesOrders(customerId).subscribe({
      next: (data: any[]) => {
        console.log(" RAW SALES DATA:", data);

        this.orders = (data || []).map(item => ({
          orderNo: this.removeLeadingZeros(item.orderNo)    || '-',
          date:        item.date        || '-',
          material:    item.material    || '-',
          description: item.description || '-',
          quantity:    item.quantity    || '-',
          unit:        item.unit        || '-',
          status:      item.status      || '-'
        }));

        this.selectedStatus = '';
        this.searchOrderNo = '';
        this.searchMaterial = '';

        this.statuses = Array.from(
          new Set(this.orders.map(d => d.status).filter(s => s && s !== '-'))
        );

        this.applyFilters();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(" SALES ERROR:", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    const orderTerm   = this.searchOrderNo.trim().toLowerCase();
    const materialTerm = this.searchMaterial.trim().toLowerCase();

    this.filteredOrders = this.orders.filter(o => {
      const statusMatch   = !this.selectedStatus || o.status === this.selectedStatus;
      const orderMatch    = !orderTerm   || o.orderNo.toLowerCase().includes(orderTerm);
      const materialMatch = !materialTerm || o.material.toLowerCase().includes(materialTerm);
      return statusMatch && orderMatch && materialMatch;
    });

    this.cdr.detectChanges();
  }

  clearFilters() {
    this.selectedStatus = '';
    this.searchOrderNo = '';
    this.searchMaterial = '';
    this.applyFilters();
  }
  goBack(): void {
  this.location.back();
}
  getUnitFullForm(unit: string): string {
    if (!unit || unit === '-') return '-';
    const upper = unit.toUpperCase();
    return this.unitMap[upper] || unit;
  }
  removeLeadingZeros(value: any): string {
  if (!value || value === '-') return '-';
  return String(value).replace(/^0+/, '') || '0';
}
}