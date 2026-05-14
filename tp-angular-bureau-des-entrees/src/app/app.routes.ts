import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'patients/search', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'admissions', loadComponent: () => import('./pages/admissions/admissions.component').then(m => m.AdmissionsComponent) },
      { path: 'patients/search', loadComponent: () => import('./pages/patient-search/patient-search.component').then(m => m.PatientSearchComponent) },
      { path: 'patients/record/:IppIdentifier', loadComponent: () => import('./pages/patient-record/patient-record.component').then(m => m.PatientRecordComponent) },
      { path: 'patients/new-admission', loadComponent: () => import('./pages/new-admission/new-admission.component').then(m => m.NewAdmissionComponent) },

    ]
  }
];
