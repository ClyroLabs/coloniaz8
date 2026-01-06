import { Component, inject, signal, computed } from '@angular/core';
import { DataService, Booking, DateSlotOverride } from '../services/data.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-brand-900 text-white shadow-lg border-b border-brand-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-brand-700 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner">Z8</div>
              <span class="font-bold text-xl tracking-tight">Admin Console</span>
            </div>
            <div class="flex items-center gap-6">
              <span class="text-sm text-brand-200 font-medium bg-brand-800 px-3 py-1 rounded-full border border-brand-700">
                <span class="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></span>
                {{ dataService.currentUser()?.username }}
              </span>
              <button (click)="logout()" class="text-sm font-bold text-brand-300 hover:text-white transition-colors">Sair</button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        
        <!-- Stats / Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <!-- Stat Card -->
           <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
             <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Agendamentos</div>
             <div class="text-4xl font-extrabold text-gray-900">{{ dataService.bookings().length }}</div>
             <div class="w-full bg-gray-100 h-1 mt-2 rounded-full overflow-hidden">
               <div class="bg-brand-500 h-full w-2/3"></div>
             </div>
           </div>

           <!-- Stat Card -->
           <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow relative overflow-hidden">
             <div class="absolute right-0 top-0 p-4 opacity-10">
               <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
             </div>
             <div class="text-gray-400 text-xs font-bold uppercase tracking-wider">Pendentes</div>
             <div class="text-4xl font-extrabold text-accent-500">{{ pendingCount() }}</div>
             <div class="text-xs text-gray-400 mt-2">Aguardando atendimento</div>
           </div>
           
           <!-- Data Actions Group -->
           <div class="grid grid-cols-2 gap-3 h-32">
             <button (click)="exportCSV()" class="bg-gradient-to-br from-green-50 to-white p-4 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all text-left flex flex-col justify-center gap-2 group h-full">
                <div class="bg-green-100 w-8 h-8 flex items-center justify-center rounded-lg text-green-600 group-hover:bg-green-200 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <div class="text-green-800 font-bold text-sm leading-tight">Exportar<br>Dados</div>
             </button>

             <button (click)="toggleImport()" class="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-2xl shadow-sm border border-yellow-100 hover:shadow-md transition-all text-left flex flex-col justify-center gap-2 group h-full">
                <div class="bg-yellow-100 w-8 h-8 flex items-center justify-center rounded-lg text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <div class="text-yellow-800 font-bold text-sm leading-tight">Importar<br>CSV</div>
             </button>
           </div>
           
           @if (dataService.currentUser()?.role === 'MASTER') {
            <button (click)="toggleSettings()" class="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-all text-left group h-32">
              <div class="flex items-center justify-between mb-4">
                <div class="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <div class="text-purple-800 font-bold text-lg">Configurações</div>
              <div class="text-xs text-purple-600/70">Equipe e Cotas</div>
            </button>
           }
        </div>

        <!-- Import Panel (Accessible to ALL Admins) -->
        @if (showImport()) {
           <div class="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 mb-8 shadow-sm animate-fade-in">
              <div class="flex justify-between items-start mb-4">
                 <h4 class="font-bold text-yellow-900 text-lg flex items-center gap-2">
                    <div class="bg-yellow-200 p-1.5 rounded-lg">
                      <svg class="w-5 h-5 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    Importação de Dados (CSV)
                 </h4>
                 <button (click)="toggleImport()" class="text-yellow-700 hover:bg-yellow-200 p-1 rounded transition-colors">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              @if (importPreview().length === 0) {
                <!-- File Select State -->
                <div class="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-yellow-100 shadow-sm">
                  <div class="text-sm text-yellow-800">
                    <p class="font-bold">Selecione um arquivo .csv para importar.</p>
                    <p class="text-xs mt-1 text-gray-500">O arquivo deve conter cabeçalho. Formatos suportados: Excel (;) ou Padrão (,).</p>
                  </div>
                  <div class="flex gap-3 w-full md:w-auto">
                      <input #importTrigger type="file" (change)="handleFileSelect($event)" class="hidden" accept=".csv">
                      <button (click)="importTrigger.click()" class="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border border-yellow-500/20 px-6 py-3 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Carregar Arquivo
                      </button>
                  </div>
                </div>
              } @else {
                <!-- Preview State -->
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg animate-fade-in">
                  <div class="bg-yellow-100 px-4 py-3 border-b border-yellow-200 flex justify-between items-center">
                      <span class="text-yellow-900 text-sm font-bold flex items-center gap-2">
                        <span class="bg-yellow-300 text-yellow-900 text-xs px-2 py-0.5 rounded-full">{{ importPreview().length }}</span>
                        registros encontrados
                      </span>
                      <button (click)="cancelImport()" class="text-xs text-red-600 hover:text-red-800 font-bold bg-white px-3 py-1 rounded border border-red-100 hover:border-red-300 transition-all">Cancelar</button>
                  </div>
                  
                  <div class="max-h-60 overflow-y-auto bg-gray-50">
                    <table class="min-w-full divide-y divide-gray-100 text-xs">
                      <thead class="bg-white sticky top-0 shadow-sm z-10">
                        <tr>
                          <th class="px-3 py-2 text-left font-bold text-gray-600">Nome</th>
                          <th class="px-3 py-2 text-left font-bold text-gray-600">Data</th>
                          <th class="px-3 py-2 text-left font-bold text-gray-600">Hora</th>
                          <th class="px-3 py-2 text-left font-bold text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                          @for (item of importPreview(); track $index) {
                            <tr>
                              <td class="px-3 py-2 text-gray-900 font-medium truncate max-w-[150px]">{{ item.name }}</td>
                              <td class="px-3 py-2 font-mono text-gray-600">{{ item.date }}</td>
                              <td class="px-3 py-2 text-gray-600">{{ item.time }}</td>
                              <td class="px-3 py-2">
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-600">{{ item.status }}</span>
                              </td>
                            </tr>
                          }
                      </tbody>
                    </table>
                  </div>

                  <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                      <button (click)="confirmImport()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        Confirmar Importação
                      </button>
                  </div>
                </div>
              }
           </div>
        }

        <!-- Settings Panel (MASTER ONLY) -->
        @if (showSettings()) {
          <div class="bg-white rounded-2xl shadow-lg mb-8 p-8 border border-purple-100 animate-fade-in relative overflow-hidden">
             <div class="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10"></div>
             
             <div class="flex justify-between items-start mb-6">
                <h3 class="font-bold text-xl text-gray-900">Configurações do Sistema</h3>
                <button (click)="toggleSettings()" class="text-gray-400 hover:text-gray-600 transition-colors">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <!-- Quotas -->
             <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
               <div>
                 <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cota Rural (Manhã)</label>
                 <input type="number" [(ngModel)]="tempQuotaRural" class="block w-full rounded-xl border-gray-300 border shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500">
               </div>
               <div>
                 <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cota Urbana (Tarde)</label>
                 <input type="number" [(ngModel)]="tempQuotaUrban" class="block w-full rounded-xl border-gray-300 border shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500">
               </div>
               <div>
                 <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">WhatsApp Geral</label>
                 <input type="text" [(ngModel)]="tempWhatsapp" class="block w-full rounded-xl border-gray-300 border shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500">
               </div>
               <div>
                 <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tempo para Auto-Conclusão (min)</label>
                 <input type="number" [(ngModel)]="tempAutoComplete" class="block w-full rounded-xl border-gray-300 border shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500" title="Tempo após o horário marcado para marcar como concluído">
               </div>
             </div>

             <!-- NEW: Booking Rules Section -->
             <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100 mb-6">
               <h4 class="font-bold text-blue-900 mb-4 text-sm flex items-center gap-2">
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 Regras de Agendamento
               </h4>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label class="block text-xs font-bold text-gray-600 mb-2">Início Seguro Defeso</label>
                   <input type="date" [(ngModel)]="tempSeguroStartDate" class="block w-full rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                 </div>
                 <div>
                   <label class="block text-xs font-bold text-gray-600 mb-2">Início DAE</label>
                   <input type="date" [(ngModel)]="tempDaeStartDate" class="block w-full rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                 </div>
                 <div>
                   <label class="block text-xs font-bold text-gray-600 mb-2">Telefone Obrigatório</label>
                   <label class="relative inline-flex items-center cursor-pointer mt-1">
                     <input type="checkbox" [(ngModel)]="tempPhoneRequired" class="sr-only peer">
                     <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                     <span class="ml-3 text-sm font-medium text-gray-700">{{ tempPhoneRequired ? 'Sim' : 'Não' }}</span>
                   </label>
                 </div>
               </div>
             </div>

              <!-- NEW: Schedule Times Section (MASTER ONLY) -->
              <div class="bg-gradient-to-r from-cyan-50 to-sky-50 p-5 rounded-xl border border-cyan-100 mb-6">
                <h4 class="font-bold text-cyan-900 mb-4 text-sm flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Horários de Atendimento
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2">Horário Início</label>
                    <input type="time" [(ngModel)]="tempScheduleStartTime" class="block w-full rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2">Horário Fim</label>
                    <input type="time" [(ngModel)]="tempScheduleEndTime" class="block w-full rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2">Intervalo (minutos)</label>
                    <input type="number" [(ngModel)]="tempScheduleIntervalMinutes" min="5" max="60" step="5" class="block w-full rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500">
                  </div>
                </div>
                <p class="text-xs text-cyan-600 mt-3 italic">
                  Horário atual: {{ tempScheduleStartTime }} às {{ tempScheduleEndTime }} (intervalos de {{ tempScheduleIntervalMinutes }} min)
                </p>
              </div>

             <!-- NEW: Blocked Dates Section -->
             <div class="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-xl border border-red-100 mb-6">
               <h4 class="font-bold text-red-900 mb-4 text-sm flex items-center gap-2">
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                 Datas Bloqueadas (Manualmente)
               </h4>
               <div class="flex gap-3 mb-3">
                 <input type="date" [(ngModel)]="newBlockedDate" class="flex-grow rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-red-500 focus:border-red-500">
                 <button (click)="addBlockedDate()" [disabled]="!newBlockedDate" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-all">
                   + Bloquear
                 </button>
               </div>
               @if (tempBlockedDates.length > 0) {
                 <div class="flex flex-wrap gap-2">
                   @for (date of tempBlockedDates; track date) {
                     <div class="bg-white px-3 py-1 rounded-full border border-red-200 text-sm flex items-center gap-2 shadow-sm">
                       <span class="font-mono text-red-800">{{ formatDateBr(date) }}</span>
                       <button (click)="removeBlockedDate(date)" class="text-red-500 hover:text-red-700 font-bold">×</button>
                     </div>
                   }
                 </div>
               } @else {
                 <p class="text-xs text-gray-500 italic">Nenhuma data bloqueada manualmente.</p>
               }
             </div>

             <!-- NEW: Date Slot Overrides Section -->
             <div class="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100 mb-6">
               <h4 class="font-bold text-green-900 mb-4 text-sm flex items-center gap-2">
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 Limite de Vagas por Data/Serviço
               </h4>
               <div class="flex flex-col md:flex-row gap-3 mb-3">
                 <input type="date" [(ngModel)]="newOverrideDate" placeholder="Data" class="flex-grow rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500">
                 <select [(ngModel)]="newOverrideService" class="rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500">
                   <option value="SEGURO">Seguro Defeso</option>
                   <option value="DAE">DAE</option>
                 </select>
                 <input type="number" [(ngModel)]="newOverrideMaxSlots" min="1" placeholder="Máx. vagas" class="w-24 rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500">
                 <button (click)="addDateSlotOverride()" [disabled]="!newOverrideDate || newOverrideMaxSlots < 1" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
                   + Adicionar
                 </button>
               </div>
               @if (tempDateSlotsOverride.length > 0) {
                 <div class="overflow-x-auto">
                   <table class="min-w-full text-sm">
                     <thead>
                       <tr class="bg-white/50">
                         <th class="px-3 py-2 text-left font-bold text-gray-600">Data</th>
                         <th class="px-3 py-2 text-left font-bold text-gray-600">Serviço</th>
                         <th class="px-3 py-2 text-left font-bold text-gray-600">Máx. Vagas</th>
                         <th class="px-3 py-2 text-right font-bold text-gray-600">Ação</th>
                       </tr>
                     </thead>
                     <tbody class="divide-y divide-green-100">
                       @for (override of tempDateSlotsOverride; track override.date + override.service) {
                         <tr class="bg-white/30">
                           <td class="px-3 py-2 font-mono">{{ formatDateBr(override.date) }}</td>
                           <td class="px-3 py-2">
                             <span [class]="'px-2 py-0.5 rounded text-xs font-bold ' + (override.service === 'SEGURO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')">{{ override.service }}</span>
                           </td>
                           <td class="px-3 py-2 font-bold text-green-800">{{ override.maxSlots }}</td>
                           <td class="px-3 py-2 text-right">
                             <button (click)="removeDateSlotOverride(override)" class="text-red-500 hover:text-red-700 text-xs font-bold">Remover</button>
                           </td>
                         </tr>
                       }
                     </tbody>
                   </table>
                 </div>
               } @else {
                 <p class="text-xs text-gray-500 italic">Nenhum limite especial configurado. Usando cotas padrão.</p>
               }
             </div>

             <!-- Security Section -->
             <div class="grid md:grid-cols-2 gap-6 mb-6">
               <!-- Password Change -->
               <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
                 <h4 class="font-bold text-purple-900 mb-3 text-sm">Segurança: Alterar Minha Senha</h4>
                 <div class="flex gap-4 items-end">
                    <div class="flex-grow">
                      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nova Senha</label>
                      <input type="password" [(ngModel)]="newPassword" placeholder="Deixe em branco para não alterar" class="block w-full rounded-lg border-gray-300 border shadow-sm p-2 text-sm focus:ring-purple-500 focus:border-purple-500">
                    </div>
                 </div>
               </div>

               <!-- Manage Admins (Master Only) - UPDATED FOR SOFT BLOCK -->
               @if (dataService.currentUser()?.role === 'MASTER') {
                 <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 class="font-bold text-blue-900 mb-3 text-sm">Gestão de Equipe (Admins)</h4>
                    <div class="space-y-2 max-h-32 overflow-y-auto pr-2">
                       @for (admin of dataService.adminUsers(); track admin.username) {
                         <div class="flex justify-between items-center bg-white p-2 rounded shadow-sm" [class.opacity-60]="!admin.active">
                            <div class="flex items-center gap-2">
                              <span [class]="'w-2 h-2 rounded-full ' + (admin.active ? 'bg-green-500' : 'bg-red-400')"></span>
                              <span class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                {{ admin.username }} 
                                @if(admin.role === 'MASTER') { <span class="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-bold">MASTER</span> }
                                @if(!admin.active) { <span class="text-[10px] bg-red-100 text-red-800 px-1 rounded font-bold">BLOQUEADO</span> }
                              </span>
                            </div>
                            
                            @if (admin.username !== 'master' && admin.username !== dataService.currentUser()?.username) {
                               <button (click)="toggleBlock(admin.username)" class="text-xs font-bold hover:underline flex items-center gap-1" [class.text-red-600]="admin.active" [class.text-green-600]="!admin.active">
                                 @if(admin.active) {
                                   <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                   Bloquear
                                 } @else {
                                   <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                   Desbloquear
                                 }
                               </button>
                            }
                         </div>
                       }
                    </div>
                 </div>
               }
             </div>

             <!-- Main Actions -->
             <div class="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
               <button (click)="saveSettings()" class="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 font-bold shadow-lg shadow-purple-500/30 transition-all">Salvar Configurações</button>
             </div>
          </div>
        }

        <!-- Booking List -->
        <div class="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden border border-gray-100">
          <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 class="text-lg font-bold text-gray-900">Agendamentos Recentes</h3>
              <div class="flex gap-2 items-center">
                <button (click)="toggleFilters()" class="text-sm font-bold text-brand-600 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  {{ showFilters() ? 'Ocultar' : 'Filtros' }}
                </button>
                <button (click)="clearAll()" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1" title="Limpar todos os agendamentos">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span class="text-xs font-bold hidden sm:inline">Limpar Tudo</span>
                </button>
              </div>
            </div>

            <!-- Advanced Filters Panel -->
            @if (showFilters()) {
              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <!-- Name Filter -->
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                    <input type="text" placeholder="Buscar por nome..." 
                        (input)="filterName.set($any($event.target).value)"
                        [value]="filterName()"
                        class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                  </div>
                  <!-- CPF Filter -->
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label>
                    <input type="text" placeholder="000.000.000-00" 
                        (input)="filterCpf.set($any($event.target).value)"
                        [value]="filterCpf()"
                        class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono">
                  </div>
                  <!-- Phone Filter -->
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                    <input type="text" placeholder="(83) 90000-0000" 
                        (input)="filterPhone.set($any($event.target).value)"
                        [value]="filterPhone()"
                        class="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono">
                  </div>
                  <!-- Service Type Filter -->
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Serviço</label>
                    <select (change)="filterService.set($any($event.target).value)"
                        [value]="filterService()"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                      <option value="">Todos</option>
                      <option value="DAE">DAE</option>
                      <option value="SEGURO">Seguro Defeso</option>
                    </select>
                  </div>
                  <!-- Date Filter -->
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                    <input type="date" 
                        (input)="filterDate.set($any($event.target).value)"
                        [value]="filterDate()"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                  </div>
                </div>
                <div class="flex justify-end mt-3 pt-3 border-t border-gray-100">
                  <button (click)="clearFilters()" class="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors">
                    Limpar Filtros
                  </button>
                </div>
              </div>
            } @else {
              <!-- Simple Search (when filters are hidden) -->
              <div class="relative max-w-md">
                <input type="text" placeholder="Busca rápida (CPF ou Nome)..." 
                    (input)="filterText.set($any($event.target).value)"
                    [value]="filterText()"
                    class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full">
                <svg class="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            }
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data/Hora</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cidadão</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Serviço</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                @for (booking of filteredBookings(); track booking.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-bold text-gray-900">{{ booking.date | date:'dd/MM/yyyy' }}</div>
                      <div class="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{{ booking.time }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ booking.name }}</div>
                      <div class="text-xs text-gray-500 font-mono">{{ booking.cpf }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                       <span class="text-sm text-gray-700 font-medium">{{ booking.service_type }}</span>
                       <div class="text-xs text-gray-400">{{ booking.zone }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="'px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ' + 
                        (booking.status === 'CONCLUIDO' ? 'bg-green-100 text-green-800' : 
                         (booking.status === 'CANCELADO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'))">
                        {{ booking.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-3">
                        @if (booking.status === 'PENDENTE') {
                          <button type="button" (click)="openReschedule(booking)" class="text-blue-600 hover:text-blue-900 font-bold text-xs uppercase tracking-wide cursor-pointer">Editar</button>
                        }
                        <button type="button" (click)="deleteBooking(booking.id)" class="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wide cursor-pointer flex items-center gap-1">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @if (filteredBookings().length === 0) {
                  <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50/30">
                       Nenhum agendamento encontrado para os critérios.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        
      </div>

      <!-- Reschedule Modal -->
      @if (reschedulingBooking()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
             <div class="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                   <h3 class="text-xl font-bold text-gray-900">Editar Agendamento</h3>
                   <p class="text-sm text-gray-500 mt-1">Reagendar data e horário.</p>
                </div>
                <button (click)="reschedulingBooking.set(null)" class="text-gray-400 hover:text-gray-600">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <!-- Read-only Info -->
             <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
               <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase">Nome</label>
                    <div class="text-sm font-bold text-gray-700 truncate">{{ reschedulingBooking()?.name }}</div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase">CPF</label>
                    <div class="text-sm font-mono text-gray-700">{{ reschedulingBooking()?.cpf }}</div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase">Zona (Fixa)</label>
                    <div class="text-sm font-bold text-gray-700">{{ reschedulingBooking()?.zone }}</div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase">Serviço</label>
                    <div class="text-sm font-bold text-gray-700">{{ reschedulingBooking()?.service_type }}</div>
                  </div>
               </div>
             </div>

             <!-- Editable Fields -->
             <div class="space-y-5">
               <div>
                 <label class="block text-sm font-bold text-gray-700 mb-2">Nova Data</label>
                 <input type="date" 
                        [(ngModel)]="newDate" 
                        (change)="updateAvailableSlots()"
                        class="block w-full rounded-lg border-gray-300 border p-3 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                 @if (dataService.isDateBlocked(newDate)) {
                   <div class="text-red-500 text-xs mt-1 font-bold">Data bloqueada (Feriado ou Fim de Semana).</div>
                 }
               </div>

               @if (newDate && !dataService.isDateBlocked(newDate)) {
                 <div>
                   <label class="block text-sm font-bold text-gray-700 mb-2">
                     Horários Disponíveis 
                     <span class="font-normal text-gray-500 text-xs ml-1">
                       ({{ reschedulingBooking()?.zone === 'RURAL' ? 'Manhã' : 'Tarde' }})
                     </span>
                   </label>
                   
                   @if (availableSlotsForReschedule().length === 0) {
                      <div class="text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg text-sm font-bold text-center">
                        Sem vagas disponíveis nesta data.
                      </div>
                   } @else {
                      <div class="grid grid-cols-4 gap-2">
                        @for (slot of availableSlotsForReschedule(); track slot.time) {
                          <button 
                            (click)="newTime = slot.time"
                            [class]="'py-2 px-1 rounded border text-sm font-bold transition-all ' + 
                              (newTime === slot.time ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300' : 'bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600')">
                            {{ slot.time }}
                          </button>
                        }
                      </div>
                   }
                 </div>
               }
             </div>

             <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
               <button (click)="reschedulingBooking.set(null)" class="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition-colors">Cancelar</button>
               <button (click)="saveReschedule()" 
                       [disabled]="!newDate || !newTime || dataService.isDateBlocked(newDate)"
                       class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all">
                 Confirmar Reagendamento
               </button>
             </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminDashboardComponent {
  dataService: DataService = inject(DataService);
  router: Router = inject(Router);

  filterText = signal('');
  showSettings = signal(false);
  showImport = signal(false);
  showFilters = signal(false);
  importPreview = signal<Booking[]>([]);

  // Advanced Filter Signals
  filterName = signal('');
  filterCpf = signal('');
  filterPhone = signal('');
  filterService = signal('');
  filterDate = signal('');

  // Edit/Reschedule State
  reschedulingBooking = signal<Booking | null>(null);
  newDate = '';
  newTime = '';
  availableSlotsForReschedule = signal<{ time: string, available: boolean }[]>([]);

  // Temp settings for form
  tempQuotaRural = this.dataService.settings().quotaRural;
  tempQuotaUrban = this.dataService.settings().quotaUrban;
  tempWhatsapp = this.dataService.settings().whatsappNumber;
  tempAutoComplete = this.dataService.settings().autoCompleteMinutes;
  // New configurable settings
  tempPhoneRequired = this.dataService.settings().phoneRequired;
  tempSeguroStartDate = this.dataService.settings().seguroStartDate;
  tempDaeStartDate = this.dataService.settings().daeStartDate;
  tempBlockedDates = [...(this.dataService.settings().blockedDates || [])];
  tempDateSlotsOverride = [...(this.dataService.settings().dateSlotsOverride || [])];
  // Schedule time settings
  tempScheduleStartTime = this.dataService.settings().scheduleStartTime || '15:30';
  tempScheduleEndTime = this.dataService.settings().scheduleEndTime || '18:00';
  tempScheduleIntervalMinutes = this.dataService.settings().scheduleIntervalMinutes || 20;
  // Form inputs for adding new entries
  newBlockedDate = '';
  newOverrideDate = '';
  newOverrideService: 'DAE' | 'SEGURO' = 'SEGURO';
  newOverrideMaxSlots = 15;
  newPassword = '';

  filteredBookings = computed(() => {
    const statusOrder = { 'PENDENTE': 1, 'CONCLUIDO': 2, 'CANCELADO': 3 };

    // Get filter values
    const textFilter = this.filterText().toLowerCase();
    const nameFilter = this.filterName().toLowerCase();
    const cpfFilter = this.filterCpf().replace(/\D/g, '');
    const phoneFilter = this.filterPhone().replace(/\D/g, '');
    const serviceFilter = this.filterService();
    const dateFilter = this.filterDate();

    return this.dataService.bookings()
      .filter(b => {
        // Simple text filter (when advanced filters are hidden)
        if (textFilter && !this.showFilters()) {
          return b.name.toLowerCase().includes(textFilter) || b.cpf.includes(textFilter);
        }

        // Advanced filters
        if (nameFilter && !b.name.toLowerCase().includes(nameFilter)) return false;
        if (cpfFilter && !b.cpf.replace(/\D/g, '').includes(cpfFilter)) return false;
        if (phoneFilter && !b.phone.replace(/\D/g, '').includes(phoneFilter)) return false;
        if (serviceFilter && b.service_type !== serviceFilter) return false;
        if (dateFilter && b.date !== dateFilter) return false;

        return true;
      })
      .sort((a, b) => {
        const statusA = statusOrder[a.status];
        const statusB = statusOrder[b.status];

        // Primary sort: by status order
        if (statusA !== statusB) {
          return statusA - statusB;
        }

        // Secondary sort: by date descending (most recent first)
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) {
          return dateComparison;
        }

        // Tertiary sort: by time descending
        return b.time.localeCompare(a.time);
      });
  });

  pendingCount = computed(() =>
    this.dataService.bookings().filter(b => b.status === 'PENDENTE').length
  );

  toggleSettings() {
    this.showSettings.update(v => !v);
    this.showImport.set(false);
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
    if (!this.showFilters()) {
      this.clearFilters();
    }
  }

  clearFilters() {
    this.filterName.set('');
    this.filterCpf.set('');
    this.filterPhone.set('');
    this.filterService.set('');
    this.filterDate.set('');
    this.filterText.set('');
  }

  toggleImport() {
    this.showImport.update(v => !v);
    this.showSettings.set(false);
  }

  // --- RESCHEDULE LOGIC ---
  openReschedule(booking: Booking) {
    this.reschedulingBooking.set(booking);
    this.newDate = booking.date;
    this.newTime = booking.time;
    this.updateAvailableSlots();
  }

  updateAvailableSlots() {
    const booking = this.reschedulingBooking();
    if (booking && this.newDate && !this.dataService.isDateBlocked(this.newDate)) {
      const slots = this.dataService.getSlotsForDateAndZone(this.newDate, booking.zone);
      if (this.newDate === booking.date) {
        const hasCurrentTime = slots.some(s => s.time === booking.time);
        if (!hasCurrentTime) {
          slots.push({ time: booking.time, available: true });
          slots.sort((a, b) => a.time.localeCompare(b.time));
        }
      }
      this.availableSlotsForReschedule.set(slots);
    } else {
      this.availableSlotsForReschedule.set([]);
    }
  }

  async saveReschedule() {
    const booking = this.reschedulingBooking();
    if (booking && this.newDate && this.newTime) {
      const result = await this.dataService.rescheduleBooking(booking.id, this.newDate, this.newTime);
      if (result.success) {
        alert(result.message);
        this.reschedulingBooking.set(null);
      } else {
        alert('Erro: ' + result.message);
      }
    }
  }

  toggleBlock(username: string) {
    this.dataService.toggleAdminStatus(username);
  }

  async deleteBooking(id: string) {
    const booking = this.dataService.bookings().find(b => b.id === id);
    if (!booking) return;

    if (confirm(`Excluir agendamento de "${booking.name}"?\n\nEsta ação não pode ser desfeita e o horário ficará disponível novamente.`)) {
      const result = await this.dataService.deleteBooking(id);
      if (result.success) {
        alert(result.message);
      } else {
        alert('Erro: ' + result.message);
      }
    }
  }

  async clearAll() {
    if (confirm('ATENÇÃO: Isso apagará TODOS os agendamentos do sistema.\n\nEsta ação não pode ser desfeita. Deseja continuar?')) {
      try {
        await this.dataService.deleteAllBookings();
        alert('Banco de dados limpo com sucesso.');
      } catch (e: any) {
        alert(e.message);
      }
    }
  }

  saveSettings() {
    this.dataService.updateSettings({
      quotaRural: this.tempQuotaRural,
      quotaUrban: this.tempQuotaUrban,
      whatsappNumber: this.tempWhatsapp,
      autoCompleteMinutes: this.tempAutoComplete,
      // New configurable settings
      phoneRequired: this.tempPhoneRequired,
      seguroStartDate: this.tempSeguroStartDate,
      daeStartDate: this.tempDaeStartDate,
      blockedDates: this.tempBlockedDates,
      dateSlotsOverride: this.tempDateSlotsOverride,
      // Schedule time settings
      scheduleStartTime: this.tempScheduleStartTime,
      scheduleEndTime: this.tempScheduleEndTime,
      scheduleIntervalMinutes: this.tempScheduleIntervalMinutes
    });

    if (this.newPassword) {
      this.dataService.updateUserPassword(this.newPassword);
      this.newPassword = '';
    }

    this.showSettings.set(false);
    alert('Configurações e credenciais salvas!');
  }

  // --- HELPER METHODS FOR NEW CONFIG ---
  addBlockedDate() {
    if (this.newBlockedDate && !this.tempBlockedDates.includes(this.newBlockedDate)) {
      this.tempBlockedDates.push(this.newBlockedDate);
      this.newBlockedDate = '';
    }
  }

  removeBlockedDate(date: string) {
    this.tempBlockedDates = this.tempBlockedDates.filter(d => d !== date);
  }

  addDateSlotOverride() {
    if (this.newOverrideDate && this.newOverrideMaxSlots > 0) {
      // Remove existing override for same date/service combo
      this.tempDateSlotsOverride = this.tempDateSlotsOverride.filter(
        o => !(o.date === this.newOverrideDate && o.service === this.newOverrideService)
      );
      // Add new override
      this.tempDateSlotsOverride.push({
        date: this.newOverrideDate,
        service: this.newOverrideService,
        maxSlots: this.newOverrideMaxSlots
      });
      this.newOverrideDate = '';
      this.newOverrideMaxSlots = 15;
    }
  }

  removeDateSlotOverride(override: DateSlotOverride) {
    this.tempDateSlotsOverride = this.tempDateSlotsOverride.filter(
      o => !(o.date === override.date && o.service === override.service)
    );
  }

  formatDateBr(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  exportCSV() {
    const csv = this.dataService.getCSVData();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  handleFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewData = this.dataService.parseCSVContent(e.target.result);
        this.importPreview.set(previewData);
        if (previewData.length === 0) {
          alert('O arquivo parece estar vazio ou o formato não foi reconhecido. Verifique se há cabeçalhos.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  }

  cancelImport() {
    this.importPreview.set([]);
  }

  async confirmImport() {
    const data = this.importPreview();
    if (data.length > 0) {
      try {
        await this.dataService.addBookingsBatch(data);
        alert(`${data.length} agendamentos importados com sucesso!`);
        this.importPreview.set([]);
      } catch (e: any) {
        alert(e.message);
      }
    }
  }

  async logout() {
    await this.dataService.logout();
    this.router.navigate(['/']);
  }
}