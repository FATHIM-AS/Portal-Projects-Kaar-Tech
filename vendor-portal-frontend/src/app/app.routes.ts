import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ProfileComponent } from './pages/profile/profile';
import { FinanceComponent } from './pages/finance/finance';
import { RfqComponent } from './pages/rfq/rfq';
import { PoComponent } from './pages/po/po';
import { GrComponent } from './pages/gr/gr';
import { InvoiceComponent } from './pages/invoice/invoice';
import { AgingComponent } from './pages/aging/aging';
import { MemoComponent } from './pages/memo/memo';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'finance', component: FinanceComponent, canActivate: [AuthGuard] },
  { path: 'rfq', component: RfqComponent, canActivate: [AuthGuard] },
  { path: 'po', component: PoComponent, canActivate: [AuthGuard] },
  { path: 'gr', component: GrComponent, canActivate: [AuthGuard] },
  { path: 'invoice', component: InvoiceComponent, canActivate: [AuthGuard] },
  { path: 'aging', component: AgingComponent, canActivate: [AuthGuard] },
  { path: 'memo', component: MemoComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'login' }
];