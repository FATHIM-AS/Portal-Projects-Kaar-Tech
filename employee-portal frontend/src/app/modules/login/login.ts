import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  employeeId: string = '';
  password: string = '';

  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (
      !this.employeeId.trim() ||
      !this.password.trim()
    ) {

      this.errorMessage =
        'Please enter Employee ID and Password';

      return;

    }

    this.loading = true;

    const formattedEmployeeId =
      this.employeeId.padStart(8, '0');

    const payload = {
      username: formattedEmployeeId,
      password: this.password
    };

    console.log(
      'LOGIN PAYLOAD:',
      payload
    );

    this.http.post(
      'http://localhost:3000/login',
      payload
    ).subscribe({

      next: (response: any) => {

        console.log(
          'LOGIN RESPONSE:',
          response
        );

        this.loading = false;

        const status =
          response?.data?.d?.Status;

        if (status === 'Success') {

          localStorage.setItem(
            'employeeId',
            formattedEmployeeId
          );

          this.successMessage =
            'Login Successful';

          setTimeout(() => {

            this.router.navigate([
              '/dashboard'
            ]);

          }, 1000);

        } else {

          this.errorMessage =
            'Invalid Employee ID or Password';

        }

      },

      error: (error) => {

        console.log(
          'LOGIN ERROR:',
          error
        );

        this.loading = false;

        this.errorMessage =
          'Invalid Employee ID or Password';

      }

    });

  }

}