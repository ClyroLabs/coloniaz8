import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { BookingComponent } from './components/booking.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { AdminLoginComponent } from './components/login.component';
import { MyBookingsComponent } from './components/my-bookings.component';
import { inject } from '@angular/core';
import { DataService } from './services/data.service';

import { AuthService } from './services/auth.service';

const adminGuard = () => {
    const auth = inject(AuthService);
    return auth.isLoggedIn();
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];