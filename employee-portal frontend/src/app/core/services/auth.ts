import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private baseUrl =
    'http://localhost:3000';

  constructor(
    private http: HttpClient
  ) {}

  login(
    empId: string,
    password: string
  ) {

    return this.http.get(
      `${this.baseUrl}/login/${empId}/${password}`
    );

  }

}