import { Component } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard {

  constructor(
    private router: Router
  ) {}

  navigate(
    page: string
  ) {

    this.router.navigate([
      `/${page}`
    ]);

  }

  logout() {

    localStorage.clear();

    this.router.navigate([
      '/'
    ]);

  }

}