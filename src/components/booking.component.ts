import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, Booking } from '../services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      <!-- Stepper Header -->
      <div class="mb-12">
        <div class="flex justify-between items-center relative">
          <!-- Connector Line -->
          <div class="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2 rounded"></div>
          
          @for (step of [1, 2, 3, 4]; track step) {
            <div class="flex flex-col items-center group cursor-default">
              <div [class]="'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 border-4 ' + 
                (currentStep() >= step ? 'bg-brand-600 border-brand-200 text-white shadow-brand-500/40 shadow-lg scale-110' : 'bg-white border-gray-200 text-gray-400')">
                @if(currentStep() > step) {
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                } @else {
                  {{step}}
                }
              </div>
              <span [class]="'text-xs font-bold uppercase tracking-wider mt-3 transition-colors duration-300 ' + (currentStep() >= step ? 'text-brand-700' : 'text-gray-400')">
                @if(step === 1) { Serviço }
                @if(step === 2) { Data }
                @if(step === 3) { Horário }
                @if(step === 4) { Dados }
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Step 1: Service & Zone -->
      @if (currentStep() === 1) {
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 animate-fade-in border border-gray-100 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
          
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">O que você precisa?</h2>
          <p class="text-gray-500 mb-8">Selecione o tipo de atendimento e sua região.</p>
          
          <div class="grid md:grid-cols-2 gap-8 mb-10">
            <!-- Service Column -->
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest px-1">Serviço</label>
              <div class="space-y-4">
                <button type="button" 
                  (click)="selectService('DAE')"
                  [class]="'w-full text-left p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden ' + 
                  (tempBooking.service_type === 'DAE' ? 'border-brand-500 bg-brand-50/50 shadow-md ring-1 ring-brand-500' : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-lg')">
                  <div class="relative z-10 flex items-start gap-4">
                    <div [class]="'p-3 rounded-lg transition-colors ' + (tempBooking.service_type === 'DAE' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white')">
                       <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <div class="font-bold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">Retirada de Guia DAE</div>
                      <div class="text-sm text-gray-500 mt-1">Emissão e regularização documental</div>
                    </div>
                  </div>
                </button>

                <button type="button" 
                  (click)="selectService('SEGURO')"
                  [class]="'w-full text-left p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden ' + 
                  (tempBooking.service_type === 'SEGURO' ? 'border-brand-500 bg-brand-50/50 shadow-md ring-1 ring-brand-500' : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-lg')">
                  <div class="relative z-10 flex items-start gap-4">
                     <div [class]="'p-3 rounded-lg transition-colors ' + (tempBooking.service_type === 'SEGURO' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white')">
                       <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <div class="font-bold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">Seguro Defeso</div>
                      <div class="text-sm text-gray-500 mt-1">Solicitação e consulta de benefício</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Zone Column -->
            <div>
              <label class="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest px-1">Zona</label>
              <div class="space-y-4">
                <button type="button" 
                  (click)="selectZone('RURAL')"
                  [class]="'w-full text-left p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden ' + 
                  (tempBooking.zone === 'RURAL' ? 'border-accent-500 bg-accent-50/30 shadow-md ring-1 ring-accent-500' : 'border-gray-200 bg-white hover:border-accent-300 hover:shadow-lg')">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-gray-900 text-lg">Zona Rural</span>
                    <span class="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700">{{ dataService.settings().quotaRural }} vagas/dia</span>
                  </div>
                  <div class="text-sm text-gray-500 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Atendimento {{ dataService.settings().scheduleRuralStartTime || '08:00' }} às {{ dataService.settings().scheduleRuralEndTime || '12:00' }}
                  </div>
                </button>

                <button type="button" 
                  (click)="selectZone('URBANA')"
                  [class]="'w-full text-left p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden ' + 
                  (tempBooking.zone === 'URBANA' ? 'border-accent-500 bg-accent-50/30 shadow-md ring-1 ring-accent-500' : 'border-gray-200 bg-white hover:border-accent-300 hover:shadow-lg')">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-gray-900 text-lg">Zona Urbana</span>
                    <span class="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700">{{ dataService.settings().quotaUrban }} vagas/dia</span>
                  </div>
                  <div class="text-sm text-gray-500 flex items-center gap-2">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Atendimento {{ dataService.settings().scheduleUrbanaStartTime || '15:30' }} às {{ dataService.settings().scheduleUrbanaEndTime || '18:00' }}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-6 border-t border-gray-100">
             <button [disabled]="!tempBooking.service_type || !tempBooking.zone"
                     (click)="nextStep()"
                     class="group relative px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 hover:shadow-brand-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95">
               <span class="flex items-center gap-2">
                 Continuar
                 <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </span>
             </button>
          </div>
        </div>
      }

      <!-- Step 2: Date Selection -->
      @if (currentStep() === 2) {
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 animate-fade-in border border-gray-100 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>

          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">Quando você pode vir?</h2>
          
          <!-- Dynamic Info Message based on Service -->
          <div class="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
             <svg class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <p class="text-sm text-blue-800">
                Para <strong>{{ tempBooking.service_type === 'DAE' ? 'Retirada de Guia DAE' : 'Seguro Defeso' }}</strong>, 
                agendamentos disponíveis a partir de <span class="font-bold underline">{{ serviceStartDateMessage() }}</span>.
             </p>
          </div>
          
          <!-- Calendar Header -->
          <div class="flex justify-between items-center mb-8 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button (click)="changeMonth(-1)" class="p-3 hover:bg-white rounded-xl text-gray-500 hover:text-brand-600 hover:shadow-sm transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h3 class="text-lg font-bold capitalize text-gray-800 tracking-wide">{{ calendarMonthName() }} <span class="text-brand-600">{{ calendarYear() }}</span></h3>
            <button (click)="changeMonth(1)" class="p-3 hover:bg-white rounded-xl text-gray-500 hover:text-brand-600 hover:shadow-sm transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-3 mb-2">
            @for (day of ['D','S','T','Q','Q','S','S']; track $index) {
              <div class="text-center text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{{day}}</div>
            }
          </div>
          <div class="grid grid-cols-7 gap-2 sm:gap-3">
            @for (empty of emptyDays(); track $index) {
              <div class="h-14"></div>
            }
            
            @for (day of monthDays(); track day) {
              @let dateStr = getFullDateString(day);
              <!-- Updated isBlocked to pass serviceType -->
              @let isBlocked = dataService.isDateBlocked(dateStr, tempBooking.service_type);
              @let isSelected = tempBooking.date === dateStr;
              @let isSoldOut = !isBlocked && isDateSoldOut(dateStr);

              <button 
                (click)="!isBlocked && !isSoldOut && selectDate(dateStr)"
                [disabled]="isBlocked || isSoldOut"
                [class]="'h-12 sm:h-14 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-200 relative overflow-hidden ' + 
                 (isSelected ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-600 ring-offset-2' : 
                  (isSoldOut ? 'bg-red-100 text-red-500 border-2 border-red-300 cursor-not-allowed' :
                   (isBlocked ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-60' : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50')))">
                {{ day }}
                @if (isSoldOut) {
                  <span class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] uppercase font-bold text-red-600 tracking-tight">Esgotado</span>
                }
              </button>
            }
          </div>

          <div class="mt-10 flex justify-between items-center pt-6 border-t border-gray-100">
             <button (click)="prevStep()" class="text-gray-500 hover:text-brand-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">Voltar</button>
             <button [disabled]="!tempBooking.date"
                     (click)="nextStep()"
                     class="px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 hover:shadow-brand-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95">
               Ver Horários
             </button>
          </div>
        </div>
      }

      <!-- Step 3: Time Selection -->
      @if (currentStep() === 3) {
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 animate-fade-in border border-gray-100 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>

          <div class="flex items-center justify-between mb-8">
             <div>
                <h2 class="text-3xl font-extrabold text-gray-900">Horários</h2>
                <p class="text-gray-500 mt-1">Disponíveis para <span class="font-bold text-brand-600">{{ tempBooking.date | date:'dd/MM/yyyy' }}</span></p>
             </div>
             <div class="bg-brand-50 text-brand-700 px-4 py-2 rounded-lg text-sm font-bold border border-brand-100 shadow-sm">
                {{ tempBooking.zone === 'RURAL' ? 'Zona Rural' : 'Zona Urbana' }}
             </div>
          </div>

          @if (availableSlots().length === 0) {
            <div class="text-center py-16 bg-red-50 rounded-2xl border border-red-100 dashed-border">
               <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p class="text-red-800 font-bold text-xl">Vagas Esgotadas</p>
               <p class="text-red-600 mt-2 max-w-md mx-auto">Infelizmente o limite de atendimentos para esta data e zona foi atingido.</p>
               <button (click)="prevStep()" class="mt-6 px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold shadow-sm transition-all">Escolher outra data</button>
            </div>
          } @else {
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
              @for (slot of availableSlots(); track slot.time) {
                <button 
                  (click)="selectTime(slot.time)"
                  [class]="'py-4 px-2 rounded-xl border font-bold transition-all shadow-sm hover:shadow-md ' + 
                    (tempBooking.time === slot.time ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-300 ring-offset-1 transform scale-105' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-600')">
                  {{ slot.time }}
                </button>
              }
            </div>
          }

          <div class="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
             <button (click)="prevStep()" class="text-gray-500 hover:text-brand-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">Voltar</button>
             <button [disabled]="!tempBooking.time"
                     (click)="nextStep()"
                     class="px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 hover:shadow-brand-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95">
               Preencher Dados
             </button>
          </div>
        </div>
      }

      <!-- Step 4: Personal Info & Confirm -->
      @if (currentStep() === 4) {
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 animate-fade-in border border-gray-100 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
          
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">Seus Dados</h2>
          <p class="text-gray-500 mb-8">Informe seus dados para gerar o comprovante.</p>
          
          <form [formGroup]="form" (ngSubmit)="submitBooking()">
            <div class="space-y-6 mb-10">
              <div class="group">
                <label class="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg class="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input type="text" formControlName="name" class="block w-full pl-10 pr-3 py-4 rounded-xl border-gray-300 shadow-sm border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white hover:bg-gray-50 focus:bg-white placeholder-gray-400 text-gray-900" placeholder="Digite seu nome completo">
                </div>
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <span class="text-xs text-red-500 font-bold mt-2 flex items-center gap-1 animate-pulse">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    Campo obrigatório
                  </span>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="group">
                  <label class="block text-sm font-bold text-gray-700 mb-2">CPF</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg class="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    </div>
                    <input type="text" 
                           formControlName="cpf" 
                           (input)="onCpfInput($event)"
                           maxlength="14"
                           placeholder="000.000.000-00" 
                           class="block w-full pl-10 pr-3 py-4 rounded-xl border-gray-300 shadow-sm border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white hover:bg-gray-50 focus:bg-white placeholder-gray-400 text-gray-900 font-mono">
                  </div>
                  @if (form.get('cpf')?.invalid && form.get('cpf')?.touched) {
                    <span class="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">CPF Inválido</span>
                  }
                </div>
                
                <div class="group">
                  <label class="block text-sm font-bold text-gray-700 mb-2">WhatsApp / Telefone <span class="text-gray-400 font-normal">(opcional)</span></label>
                  <div class="relative">
                     <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg class="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                     </div>
                     <input type="text" 
                            formControlName="phone" 
                            (input)="onPhoneInput($event)"
                            maxlength="15"
                            placeholder="(83) 90000-0000" 
                            class="block w-full pl-10 pr-3 py-4 rounded-xl border-gray-300 shadow-sm border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white hover:bg-gray-50 focus:bg-white placeholder-gray-400 text-gray-900 font-mono">
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary Card -->
            <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl mb-10 border border-gray-200 shadow-inner">
               <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                 <svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                 Revisão
               </h4>
               <div class="grid grid-cols-2 gap-y-3 text-sm">
                 <span class="text-gray-500 font-medium">Serviço</span> <span class="font-bold text-gray-900 text-right">{{ tempBooking.service_type }}</span>
                 <span class="text-gray-500 font-medium">Zona</span> <span class="font-bold text-gray-900 text-right">{{ tempBooking.zone }}</span>
                 <div class="col-span-2 h-px bg-gray-100 my-1"></div>
                 <span class="text-gray-500 font-medium">Data</span> <span class="font-bold text-brand-700 text-right">{{ tempBooking.date | date:'dd/MM/yyyy' }}</span>
                 <span class="text-gray-500 font-medium">Hora</span> <span class="font-bold text-brand-700 text-right">{{ tempBooking.time }}</span>
               </div>
            </div>

            <div class="flex justify-between items-center pt-6 border-t border-gray-100">
               <button type="button" (click)="prevStep()" class="text-gray-500 hover:text-brand-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">Voltar</button>
               <button type="submit" 
                       [disabled]="form.invalid"
                       class="px-8 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 hover:shadow-green-500/30 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 w-full sm:w-auto">
                 CONFIRMAR AGENDAMENTO
               </button>
            </div>
          </form>
        </div>
      }

      <!-- Success Modal / Overlay -->
      @if (successBooking()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/90 backdrop-blur-md p-4 animate-fade-in">
          <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center relative overflow-hidden border-4 border-white/10 ring-1 ring-white/20">
            
            <!-- Success Icon Animation -->
            <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6 animate-bounce-short border-4 border-white shadow-lg">
              <svg class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 class="text-3xl font-black text-gray-900 mb-2 tracking-tight">Agendamento Realizado!</h3>
            <p class="text-gray-500 mb-8 text-lg">Seu atendimento foi confirmado.</p>

            <div class="bg-brand-50 p-8 rounded-2xl border border-brand-100 mb-8 relative group shadow-inner">
               <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-brand-100 text-xs font-bold text-brand-600 uppercase tracking-widest shadow-sm">Protocolo</div>
               <p class="font-mono font-bold text-4xl text-brand-800 tracking-widest select-all">{{ successBooking()?.id }}</p>
               <p class="text-xs text-brand-400 mt-2 font-medium">Apresente este número na recepção</p>
            </div>
            
            <div class="space-y-3">
              <button (click)="printReceipt()" class="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Imprimir Comprovante
              </button>
              
              <button (click)="goHome()" class="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 hover:text-brand-600 hover:border-brand-200 rounded-xl font-bold transition-colors">
                Voltar para Início
              </button>
            </div>
            
            <!-- Printable Receipt Area -->
            <div id="receipt-print" class="hidden">
               <div style="font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #000; background: #fff; color: #000;">
                 <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">Colônia Z8</h2>
                    <p style="margin: 5px 0 0 0; font-size: 12px;">Pescadores de Boqueirão - PB</p>
                 </div>
                 
                 <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 20px; text-align: center;">
                   <p style="margin: 0; font-size: 14px; font-weight: bold;">COMPROVANTE DE AGENDAMENTO</p>
                 </div>

                 <div style="margin-bottom: 20px;">
                   <p style="margin: 5px 0; font-size: 14px;"><strong>PROTOCOLO:</strong> <span style="font-size: 18px;">{{ successBooking()?.id }}</span></p>
                   <p style="margin: 5px 0; font-size: 14px;"><strong>NOME:</strong> {{ successBooking()?.name }}</p>
                   <p style="margin: 5px 0; font-size: 14px;"><strong>CPF:</strong> {{ successBooking()?.cpf }}</p>
                   <p style="margin: 5px 0; font-size: 14px;"><strong>DATA:</strong> {{ successBooking()?.date | date:'dd/MM/yyyy' }}</p>
                   <p style="margin: 5px 0; font-size: 14px;"><strong>HORÁRIO:</strong> {{ successBooking()?.time }}</p>
                   <p style="margin: 5px 0; font-size: 14px;"><strong>SERVIÇO:</strong> {{ successBooking()?.service_type }}</p>
                 </div>

                 <div style="border: 1px solid #000; padding: 10px; margin-bottom: 20px; font-size: 12px; text-align: center;">
                    <p style="margin: 0; font-weight: bold;">IMPORTANTE</p>
                    <p style="margin: 5px 0 0 0;">Chegar com 15 minutos de antecedência.</p>
                    <p style="margin: 0;">Trazer documentos originais.</p>
                 </div>
                 
                 <div style="text-align: center; font-size: 10px;">
                   <p style="margin: 0;">Emitido em: {{ today | date:'dd/MM/yyyy HH:mm:ss' }}</p>
                   <p style="margin: 5px 0 0 0;">Sistema Oficial SGA - Z8</p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-bounce-short { animation: bounceShort 1s ease-in-out; }
    .dashed-border { background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23FECACA' stroke-width='2' stroke-dasharray='12%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e"); border: none; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounceShort {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `]
})
export class BookingComponent {
  dataService: DataService = inject(DataService);
  router: Router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);

  currentStep = signal(1);
  tempBooking: Partial<Booking> = {
    service_type: undefined,
    zone: undefined,
    date: undefined,
    time: undefined
  };

  // Calendar State
  today = new Date();
  displayDate = signal(new Date());

  // Form - Phone is now optional (configured in AppSettings)
  form = this.fb.group({
    name: ['', Validators.required],
    cpf: ['', [Validators.required, Validators.minLength(14)]],
    phone: ['']  // Optional - no Validators.required
  });

  successBooking = signal<Booking | null>(null);

  calendarYear = computed(() => this.displayDate().getFullYear());
  calendarMonthName = computed(() => this.displayDate().toLocaleDateString('pt-BR', { month: 'long' }));

  serviceStartDateMessage = computed(() => {
    const settings = this.dataService.settings();
    if (this.tempBooking.service_type === 'DAE') {
      const daeDate = settings.daeStartDate || '2026-01-14';
      const [y, m, d] = daeDate.split('-');
      return `${d}/${m}/${y}`;
    }
    if (this.tempBooking.service_type === 'SEGURO') {
      const seguroDate = settings.seguroStartDate || '2026-01-12';
      const [y, m, d] = seguroDate.split('-');
      return `${d}/${m}/${y}`;
    }
    return '';
  });

  monthDays = computed(() => {
    const date = this.displayDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  });

  emptyDays = computed(() => {
    const date = this.displayDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    return Array.from({ length: firstDayIndex });
  });

  availableSlots = computed(() => {
    if (!this.tempBooking.date || !this.tempBooking.zone) return [];
    return this.dataService.getSlotsForDateAndZone(this.tempBooking.date, this.tempBooking.zone, this.tempBooking.service_type);
  });

  changeMonth(delta: number) {
    const current = this.displayDate();
    this.displayDate.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  getFullDateString(day: number): string {
    const date = this.displayDate();
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  selectService(type: 'DAE' | 'SEGURO') {
    this.tempBooking.service_type = type;
  }
  selectZone(zone: 'RURAL' | 'URBANA') {
    this.tempBooking.zone = zone;
  }
  selectDate(dateStr: string) {
    this.tempBooking.date = dateStr;
    this.tempBooking.time = undefined; // reset time if date changes
  }
  selectTime(time: string) {
    this.tempBooking.time = time;
  }

  /**
   * Checks if a date has all slots taken (sold out) for the selected zone and service
   */
  isDateSoldOut(dateStr: string): boolean {
    if (!this.tempBooking.zone || !this.tempBooking.service_type) return false;

    // Get available slots for the date - if empty, the date is sold out
    const slots = this.dataService.getSlotsForDateAndZone(
      dateStr,
      this.tempBooking.zone,
      this.tempBooking.service_type
    );

    return slots.length === 0;
  }

  nextStep() {
    this.currentStep.update(s => s + 1);

    // UX Improvement: Jump to Jan 2026 automatically if we are in Step 2 
    // and the current calendar view is behind the required start dates.
    if (this.currentStep() === 2) {
      const viewDate = this.displayDate();
      if (viewDate.getFullYear() < 2026 || (viewDate.getFullYear() === 2026 && viewDate.getMonth() === 0)) {
        // Force set to Jan 2026 so user sees the allowed dates immediately
        this.displayDate.set(new Date(2026, 0, 1));
      }
    }
  }
  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  // --- Masking Logic ---
  onCpfInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    // Apply Mask 000.000.000-00
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
    }

    this.form.get('cpf')?.setValue(value, { emitEvent: false });
  }

  onPhoneInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    // Apply Mask (00) 00000-0000
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, '($1');
    }

    this.form.get('phone')?.setValue(value, { emitEvent: false });
  }

  async submitBooking() {
    if (this.form.valid && this.tempBooking.date && this.tempBooking.time && this.tempBooking.zone && this.tempBooking.service_type) {
      const formVal = this.form.value;

      try {
        const result = await this.dataService.addBooking({
          name: formVal.name!,
          cpf: formVal.cpf!,
          phone: formVal.phone!,
          date: this.tempBooking.date,
          time: this.tempBooking.time,
          zone: this.tempBooking.zone,
          service_type: this.tempBooking.service_type
        });
        this.successBooking.set(result);
      } catch (e: any) {
        alert('Erro ao realizar agendamento: ' + e.message);
      }
    }
  }

  printReceipt() {
    const content = document.getElementById('receipt-print')?.innerHTML;
    if (!content) {
      alert('Não foi possível gerar o comprovante para impressão.');
      return;
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // For iOS Safari, use a different approach - print in current window
    if (isIOS) {
      this.printReceiptIOS(content);
      return;
    }

    // Standard approach for desktop browsers
    const win = window.open('', '_blank', 'height=600,width=800,scrollbars=yes');
    if (win) {
      const printContent = this.buildPrintDocument(content);
      win.document.write(printContent);
      win.document.close();

      // Wait for document to be fully loaded before printing
      win.onload = () => {
        setTimeout(() => {
          try {
            win.print();
          } catch (e) {
            // Fallback for older browsers
            try {
              win.document.execCommand('print', false);
            } catch (e2) {
              console.error('Print failed:', e2);
            }
          }
        }, 250);
      };
    } else {
      // Fallback if popup blocked - use current window approach
      this.printReceiptIOS(content);
    }
  }

  private buildPrintDocument(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprovante de Agendamento - Colônia Z8</title>
        <style>
          @page { 
            size: auto; 
            margin: 10mm; 
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #fff;
            color: #000;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }

  private printReceiptIOS(content: string) {
    // Create a hidden iframe for iOS printing
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      // Fallback: create a print-friendly overlay
      this.showPrintableOverlay(content);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(this.buildPrintDocument(content));
    iframeDoc.close();

    // Give the iframe time to render
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();

        // Try using execCommand first (better Safari support)
        try {
          const success = iframe.contentWindow?.document.execCommand('print', false);
          if (!success) {
            iframe.contentWindow?.print();
          }
        } catch (e) {
          iframe.contentWindow?.print();
        }
      } catch (e) {
        console.error('iOS print failed:', e);
        // Last resort: show printable overlay
        this.showPrintableOverlay(content);
      } finally {
        // Clean up iframe after a delay
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    }, 500);
  }

  private showPrintableOverlay(content: string) {
    // Create a full-screen printable overlay as last resort
    const overlay = document.createElement('div');
    overlay.id = 'print-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      z-index: 99999;
      padding: 20px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    overlay.innerHTML = `
      <div style="max-width: 400px; width: 100%;">
        <div style="text-align: center; margin-bottom: 20px;">
          <button id="print-now-btn" style="
            background: #0891b2; 
            color: white; 
            padding: 15px 40px; 
            border: none; 
            border-radius: 10px; 
            font-size: 18px; 
            font-weight: bold;
            cursor: pointer;
            margin-right: 10px;
          ">📄 Imprimir Agora</button>
          <button id="close-overlay-btn" style="
            background: #6b7280; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 10px; 
            font-size: 18px; 
            font-weight: bold;
            cursor: pointer;
          ">✕ Fechar</button>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 20px;">
          📱 Dica: Você também pode tirar um screenshot desta tela
        </p>
        ${content}
      </div>
    `;

    document.body.appendChild(overlay);

    const printBtn = document.getElementById('print-now-btn');
    const closeBtn = document.getElementById('close-overlay-btn');

    printBtn?.addEventListener('click', () => {
      window.print();
    });

    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}