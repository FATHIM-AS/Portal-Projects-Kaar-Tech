import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { Location } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  profile: any = {};
  loading = true;

  constructor(
    private api: ApiService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;

    this.api.getProfile().subscribe({
      next: (res: any) => {
        console.log("PROFILE RESPONSE:", res);

        if (res.success && res.data && res.data.length > 0) {

          const p = res.data[0];

          this.profile = {
            vendorId: p.VendorId || '-',
            name: p.Name1 || '-',
            address: p.Stras || '-',
            city: p.Ort01 || '-',
            postal: p.Pstlz || '-',
            country: p.Land1 || '-'
          };

        } else {
          this.profile = {};
        }

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error("PROFILE ERROR:", err);
        this.profile = {};
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.location.back();
  }
}