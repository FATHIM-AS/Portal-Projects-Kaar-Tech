import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = 'http://localhost:3000/api/vendor';

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.base}/login`, data);
  }

  getRawVendor(): string {
    return localStorage.getItem('vendor') || '';  
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.base}/profile/${this.getRawVendor()}`);
  }

  getRFQ(): Observable<any> {
    return this.http.get(`${this.base}/rfq/${this.getRawVendor()}`);
  }

  getPO(): Observable<any> {
    return this.http.get(`${this.base}/po/${this.getRawVendor()}`);
  }

  getGR(): Observable<any> {
    return this.http.get(`${this.base}/gr/${this.getRawVendor()}`);
  }

  getInvoice(): Observable<any> {
    return this.http.get(`${this.base}/invoice/${this.getRawVendor()}`);
  }

  getInvoicePdf(belnr: string): string {
    return `${this.base}/invoice-pdf/${belnr}`;
  }

  getAging(): Observable<any> {
    return this.http.get(`${this.base}/aging/${this.getRawVendor()}`);
  }

  getMemo(): Observable<any> {
    return this.http.get(`${this.base}/memo/${this.getRawVendor()}`);
  }
}