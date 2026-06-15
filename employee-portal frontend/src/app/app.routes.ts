import { Routes } from '@angular/router';

import { Login } from './modules/login/login';

import { Dashboard } from './modules/dashboard/dashboard';

import { Profile } from './modules/profile/profile';

import { Leave } from './modules/leave/leave';

import { Payslip } from './modules/payslip/payslip';

export const routes: Routes = [

  {
    path: '',
    component: Login
  },

  {
    path: 'dashboard',
    component: Dashboard
  },

  {
    path: 'profile',
    component: Profile
  },

  {
    path: 'leave',
    component: Leave
  },

  {
    path: 'payslip',
    component: Payslip
  },
  {
    path: '**',
    redirectTo: ''
  }

];