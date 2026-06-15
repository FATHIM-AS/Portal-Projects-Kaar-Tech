import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ProfileComponent } from './pages/profile/profile';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { InquiryComponent } from './pages/inquiry/inquiry';
import { SalesOrderComponent } from './pages/sales-order/sales-order';
import { DeliveryComponent } from './pages/delivery/delivery';
import { FinanceComponent } from './pages/finance/finance';
import { authGuard } from './core/services/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'inquiry', component: InquiryComponent, canActivate: [authGuard] },
  { path: 'sales-order', component: SalesOrderComponent, canActivate: [authGuard] },
  { path: 'delivery', component: DeliveryComponent, canActivate: [authGuard] },
  { path: 'finance', component: FinanceComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];