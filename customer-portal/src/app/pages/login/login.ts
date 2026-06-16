import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  customerId = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('customerId')) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.customerId, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res.status === 'S') {
          localStorage.setItem('customerName', res.name || res.NAME || 'Customer');
          localStorage.setItem('customerId', this.customerId);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Login failed';
        }
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Login error. Please try again.';
      }
    });
  }
}