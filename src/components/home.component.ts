import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white relative overflow-hidden">
      
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500"></div>
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-60"></div>
      <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-accent-100 rounded-full blur-3xl opacity-40"></div>

      <!-- Hero Section -->
      <div class="text-center max-w-3xl px-6 py-12 animate-fade-in-up z-10">
        <div class="mb-8 flex justify-center">
           <!-- Logo Image -->
           <div class="h-48 w-48 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-500 overflow-hidden relative z-10">
              <img src="https://i.ibb.co/ksmpTyYg/z8-pescadores-removebg-preview.png" alt="Logo Colônia Z8" class="w-full h-full object-contain p-2">
           </div>
        </div>

        <h1 class="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Colônia de Pescadores <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">Z8</span>
        </h1>
        
        <div class="bg-brand-50/50 backdrop-blur-sm border border-brand-100 rounded-xl p-6 mb-10 shadow-sm max-w-2xl mx-auto">
          <p class="text-2xl font-bold text-brand-900 leading-tight">
            Sistema Oficial de Agendamento.
          </p>
          <p class="text-lg text-brand-700 mt-2 font-medium">
            Organização, agilidade e respeito ao pescador de Boqueirão-PB.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-5 justify-center">
          <a routerLink="/booking" 
             class="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
             Realizar Agendamento
          </a>

          <a routerLink="/my-bookings" 
             class="px-8 py-4 bg-white border border-gray-200 text-brand-800 hover:bg-brand-50 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
             Meus Agendamentos
          </a>
        </div>
      </div>

      <!-- Info Footer -->
      <div class="absolute bottom-6 text-center w-full">
         <div class="h-px w-24 bg-gray-200 mx-auto mb-4"></div>
         <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold">Boqueirão • Paraíba</p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.8s ease-out forwards;
    }
  `]
})
export class HomeComponent {}