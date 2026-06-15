import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from '../profile/profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProfileComponent 
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  customerName: string = '';

  ngOnInit(): void {
    
    this.customerName = localStorage.getItem('customerName') || 'Customer';
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}