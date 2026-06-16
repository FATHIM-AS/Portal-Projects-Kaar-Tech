import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  setVendor(vendorId: string) {
    localStorage.setItem('vendor', vendorId);
  }

  getVendor() {
    return localStorage.getItem('vendor');
  }

  isLoggedIn() {
    return !!localStorage.getItem('vendor');
  }

  logout() {
    localStorage.removeItem('vendor');
  }
}