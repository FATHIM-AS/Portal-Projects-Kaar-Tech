import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-finance',
  imports: [CommonModule],
  templateUrl: './finance.html',
  styleUrls: ['./finance.css']
})
export class FinanceComponent {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  goBack() {
    this.location.back();
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}