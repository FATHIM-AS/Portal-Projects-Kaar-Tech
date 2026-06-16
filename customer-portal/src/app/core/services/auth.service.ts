import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(customerId: string, password: string) {
  return this.http.get<any>(
    `http://localhost:3000/login/${customerId}/${password}`
  );
}
}