import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class LeaveService {

  baseUrl =
    'http://localhost:3000';

  constructor(
    private http: HttpClient
  ) {}

  getLeaveDetails(
    empId: string
  ) {

    return this.http.get(
      `${this.baseUrl}/leave/${empId}`
    );

  }

}