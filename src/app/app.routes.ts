import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'vsl-no-form',
    loadComponent: () => import('./pages/vsl-no-form/vsl-no-form.component').then(m => m.VslNoFormComponent)
  },
  {
    path: 'payment-success',
    loadComponent: () => import('./pages/payment-success/payment-success').then(m => m.PaymentSuccess)
  },
  {
    path: 'polityka-prywatnosci',
    loadComponent: () => import('./pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'regulamin',
    loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: '',
    redirectTo: 'vsl-no-form',
    pathMatch: 'full'
  }
];
