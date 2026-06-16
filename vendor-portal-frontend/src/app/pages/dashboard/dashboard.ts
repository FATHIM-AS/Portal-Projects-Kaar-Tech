import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  vendorName = 'Loading...';
  showMenu = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.api.getProfile().subscribe((res: any) => {
      if (res && res.data && res.data.length > 0) {
        this.vendorName = res.data[0].Name1;
      } else {
        this.vendorName = 'Vendor';
      }
      this.cdr.detectChanges();
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.clear();              
    this.router.navigate(['/login']);  
  }

  goRFQ() { this.router.navigate(['/rfq']); }
  goPO()  { this.router.navigate(['/po']); }
  goGR()  { this.router.navigate(['/gr']); }
  goFinance() { this.router.navigate(['/finance']); }
}