import { Component } from '@angular/core';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  vendorId = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onVendorChange(event: any) {
    let value = event.target.value;
    value = value.replace(/^0+/, '');
    event.target.value = value;
    this.vendorId = value;
    this.error = '';
  }

  onPasswordChange(event: any) {
    this.password = event.target.value;
  }

  login() {
    this.error = '';

    if (!this.vendorId || !this.password) {
      this.error = 'Enter Vendor ID and Password';
      return;
    }

    const formattedVendor = this.vendorId;

    this.api.login({
      vendorId: formattedVendor,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.auth.setVendor(res.vendor.vendorId);
          this.router.navigate(['/dashboard']);
        } else {
          this.error = res.message || 'Invalid Vendor ID or Password';
        }
      },
      error: () => {
        this.error = 'Cannot connect to server';
      }
    });
  }
}