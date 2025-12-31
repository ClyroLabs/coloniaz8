import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="flex flex-col min-h-screen">
      <!-- Top Header -->
      <header class="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-3 group">
            <!-- Logo Image -->
            <img src="https://i.ibb.co/ksmpTyYg/z8-pescadores-removebg-preview.png" alt="Logo Z8" class="h-14 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform">
            
            <div class="flex flex-col">
              <span class="text-lg font-extrabold text-brand-900 leading-tight">Colônia Z8</span>
              <span class="text-[10px] text-accent-600 font-bold uppercase tracking-widest">Pescadores</span>
            </div>
          </a>
          
          <div class="flex items-center gap-4">
            <!-- WhatsApp Button (Header Position) -->
            <a [href]="'https://wa.me/' + dataService.settings().whatsappNumber" 
               target="_blank"
               class="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-4 py-2 shadow-md transition-all transform hover:scale-105 flex items-center gap-2 group border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              <div class="hidden sm:flex flex-col">
                 <span class="font-bold leading-none text-xs">WhatsApp</span>
                 <span class="text-[9px] opacity-90">Atendimento</span>
              </div>
            </a>

            <div class="h-8 w-px bg-gray-200 mx-2"></div>

            <!-- Dynamic Admin Link -->
            @if (dataService.currentUser()) {
               <a routerLink="/admin" class="text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 border border-brand-200 shadow-sm">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Painel
              </a>
            } @else {
              <a routerLink="/admin-login" class="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Admin
              </a>
            }
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow relative">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  dataService = inject(DataService);
}