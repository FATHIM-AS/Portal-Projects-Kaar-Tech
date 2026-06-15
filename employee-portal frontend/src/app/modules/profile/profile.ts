import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  employeeData: any = null;

  loading: boolean = true;

  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {

    const employeeId =
      localStorage.getItem('employeeId');

    console.log(
      'Employee ID from localStorage:',
      employeeId
    );

    if (!employeeId) {

      this.loading = false;

      this.errorMessage =
        'Employee ID not found';

      return;

    }

    this.loadProfile(employeeId);

  }

  loadProfile(employeeId: string): void {

    this.loading = true;

    this.http.get(
      `http://localhost:3000/profile/${employeeId}`
    )
    .subscribe({

      next: (response: any) => {

        console.log(
          'PROFILE RESPONSE:',
          response
        );

        this.loading = false;

        if (
          response &&
          response.d
        ) {

          this.employeeData =
            response.d;

        } else {

          this.errorMessage =
            'Employee details not available';

        }

      },

      error: (error) => {

        console.log(
          'PROFILE ERROR:',
          error
        );

        this.loading = false;

        this.errorMessage =
          'Unable to fetch employee details';

      }

    });

  }

  goBack(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}