import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Blobs - Low Z-Index -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-50 z-0"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-50 z-0"></div>

      <!-- Main Card - High Z-Index -->
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl relative z-50 border border-gray-100">
        <div class="text-center">
          <div class="mx-auto h-16 w-16 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
            Z8
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Área Administrativa</h2>
          <p class="mt-2 text-sm text-gray-500">Acesso via Supabase Auth</p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div class="relative z-20">
              <label for="email" class="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input id="email" 
                     type="email" 
                     formControlName="email" 
                     class="block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm shadow-sm transition-all select-text bg-white" 
                     placeholder="admin@exemplo.com">
            </div>
            <div class="relative z-20">
              <label for="password" class="block text-sm font-bold text-gray-700 mb-1">Senha</label>
              <input id="password" 
                     type="password" 
                     formControlName="password" 
                     class="block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm shadow-sm transition-all select-text bg-white" 
                     placeholder="Sua senha">
            </div>
          </div>

          @if (error) {
             <div class="bg-red-50 text-red-600 text-xs text-center py-3 px-2 rounded-lg font-medium border border-red-100 animate-pulse">
               {{ errorMessage }}
             </div>
          }

          <div>
            <button type="submit" [disabled]="loading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-800 hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-lg hover:shadow-xl transition-all z-20 cursor-pointer disabled:opacity-70">
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
             <a routerLink="/" class="text-sm font-medium text-gray-400 hover:text-brand-600 transition-colors relative z-20">Voltar para Início</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminLoginComponent {
  fb: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  error = false;
  errorMessage = '';
  loading = false;

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin']);
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      this.error = false;
      try {
        await this.authService.login(this.form.value.email!, this.form.value.password!);
        this.router.navigate(['/admin']);
      } catch (err: any) {
        this.error = true;
        this.errorMessage = err.message || 'Erro ao realizar login.';
      } finally {
        this.loading = false;
      }
    }
  }
}