import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const customerId = localStorage.getItem('customerId');

  if (customerId) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};