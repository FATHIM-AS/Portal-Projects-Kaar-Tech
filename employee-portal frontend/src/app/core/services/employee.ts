import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class EmployeeService {

  baseUrl =
    'http://localhost:3000';

  constructor(
    private http: HttpClient
  ) {}

  getProfile(empId: string) {

    return this.http.get(
      `${this.baseUrl}/profile/${empId}`
    );

  }

}