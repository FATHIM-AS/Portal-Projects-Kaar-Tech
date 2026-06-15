import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  profile: any = {};
  fields: { key: string; label: string; value: any }[] = [];
  showDropdown = false;

  // ✅ Store initial as a property — updates once API responds
  profileInitial: string = '';

  constructor(private service: CustomerService) {}

  ngOnInit(): void {
    const customerId = localStorage.getItem('customerId') || '0000000002';

    // ✅ Pre-fill initial from localStorage immediately (no flicker)
    const cachedName = localStorage.getItem('customerName') || '';
    this.profileInitial = cachedName ? cachedName.charAt(0).toUpperCase() : 'U';

    this.loadProfile(customerId);
  }

  removeLeadingZeros(value: any): string {
    if (!value) return '-';
    return String(value).replace(/^0+/, '') || '0';
  }

  formatLabel(key: string): string {
    const customLabels: any = {
      kunnr: 'Customer ID',
      name: 'Name',
      city: 'City',
      country: 'Country'
    };

    if (customLabels[key.toLowerCase()]) {
      return customLabels[key.toLowerCase()];
    }

    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }

  loadProfile(customerId: string) {
    this.service.getProfile(customerId).subscribe({
      next: (res: any) => {
        this.profile = res || {};

        // ✅ Update initial from API response and cache it
        if (this.profile.name) {
          this.profileInitial = this.profile.name.charAt(0).toUpperCase();
          localStorage.setItem('customerName', this.profile.name);
        }

        const entries = Object.entries(this.profile);
        this.fields = entries.map(([key, value]) => {
          let val = value;
          if (key.toLowerCase() === 'kunnr') {
            val = this.removeLeadingZeros(value);
          }
          return {
            key,
            label: this.formatLabel(key),
            value: val || '-'
          };
        });
      },
      error: () => {
        this.fields = [];
      }
    });
  }

  // ✅ No longer needed in template — kept for safety but profileInitial is used instead
  getInitial(): string {
    return this.profileInitial;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (!event.target.closest('.profile-container')) {
      this.showDropdown = false;
    }
  }
}