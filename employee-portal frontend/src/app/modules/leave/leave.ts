import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './leave.html',
  styleUrl: './leave.css'
})

export class Leave implements OnInit {

  leaveData: any[] = [];

  filteredLeaveData: any[] = [];

  uniqueLeaveTypes: string[] = [];

  loading = true;

  errorMessage = '';

  selectedLeaveType = '';

  selectedStatus = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {

    const employeeId =
      localStorage.getItem('employeeId');

    if (!employeeId) {

      this.loading = false;

      this.errorMessage =
        'Employee Id not found';

      return;

    }

    this.http.get(
      `http://localhost:3000/leave/${employeeId}`
    ).subscribe({

      next: (response: any) => {

        console.log(response);

        this.loading = false;

        if (
          response &&
          response.d &&
          response.d.results
        ) {

          this.leaveData =
            response.d.results;

          this.filteredLeaveData =
            response.d.results;

          this.extractUniqueLeaveTypes();

        } else {

          this.errorMessage =
            'No leave data available';

        }

      },

      error: (error) => {

        console.log(error);

        this.loading = false;

        this.errorMessage =
          'Unable to fetch leave details';

      }

    });

  }

  extractUniqueLeaveTypes(): void {

    const leaveTypes =
      this.leaveData.map(
        (item: any) => item.LeaveType
      );

    this.uniqueLeaveTypes =
      [...new Set(leaveTypes)];

  }

  applyFilters(): void {

    this.filteredLeaveData =
      this.leaveData.filter((item: any) => {

        const leaveMatch =
          this.selectedLeaveType === '' ||
          item.LeaveType ===
          this.selectedLeaveType;

        const statusMatch =
          this.selectedStatus === '' ||
          item.LeaveStatus ===
          this.selectedStatus;

        return (
          leaveMatch &&
          statusMatch
        );

      });

  }

  clearFilters(): void {

    this.selectedLeaveType = '';

    this.selectedStatus = '';

    this.filteredLeaveData =
      [...this.leaveData];

  }

  formatDate(dateValue: string): string {

    if (!dateValue) {

      return '-';

    }

    const timestamp =
      Number(
        dateValue
        .replace('/Date(', '')
        .replace(')/', '')
      );

    const date =
      new Date(timestamp);

    return date.toLocaleDateString(
      'en-GB'
    );

  }

  goBack(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}