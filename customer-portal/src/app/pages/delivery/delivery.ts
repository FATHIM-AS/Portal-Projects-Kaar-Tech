import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.html',
  styleUrls: ['./delivery.css']
})
export class DeliveryComponent implements OnInit {

  private service = inject<CustomerService>(CustomerService);
  private cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  private location = inject(Location);

  deliveries: any[] = [];
  filteredDeliveries: any[] = [];

  shippingPoints: string[] = [];
  selectedShippingPoint: string = '';

  searchDelivery: string = '';

  loading: boolean = true;

  ngOnInit(): void {
    let customerId = localStorage.getItem('customerId');

    if (!customerId) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    customerId = customerId.padStart(10, '0');
    this.loadData(customerId);
  }

  loadData(customerId: string) {
    this.service.getDeliveries(customerId).subscribe({
      next: (data: any[]) => {

        this.deliveries = (data || []).map(item => ({
          deliveryNumber: this.removeLeadingZeros(item.deliveryNumber) || '-',
          createdDate: item.createdDate || '-',
          deliveryDate: item.deliveryDate || '-',
          storageLocation: item.storageLocation || '-',
          shippingPoint: item.shippingPoint || '-'
        }));

        this.filteredDeliveries = [...this.deliveries];

        this.shippingPoints = Array.from(
          new Set(this.deliveries.map(d => d.shippingPoint).filter(sp => sp && sp !== '-'))
        );

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    const search = this.searchDelivery.trim();

    this.filteredDeliveries = this.deliveries.filter(d =>
      (!this.selectedShippingPoint || d.shippingPoint === this.selectedShippingPoint) &&
      (!search || d.deliveryNumber.includes(search))
    );

    this.cdr.detectChanges();
  }

  clearFilters() {
    this.searchDelivery = '';
    this.selectedShippingPoint = '';
    this.filteredDeliveries = [...this.deliveries];
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.location.back();
  }

  removeLeadingZeros(value: any): string {
    if (!value || value === '-') return '-';
    return String(value).replace(/^0+/, '') || '0';
  }
}