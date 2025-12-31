import { Component, inject, signal, computed } from '@angular/core';
import { DataService, Booking } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div class="max-w-xl w-full">
        
        <div class="text-center mb-10">
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Meus Agendamentos</h2>
          <p class="mt-2 text-gray-500">Consulte, corrija seus dados ou reagende.</p>
        </div>

        <!-- Search Box (Global) -->
        <div class="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 mb-10 border border-gray-100">
          <label class="block text-sm font-bold text-gray-700 mb-2">Informe seus dados para busca</label>
          <div class="flex gap-3">
            <input type="text" 
                   [(ngModel)]="searchTerm" 
                   (keyup.enter)="search()"
                   placeholder="Nome, CPF, Telefone ou Protocolo..." 
                   class="flex-1 rounded-xl border-gray-300 border p-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm text-lg placeholder-gray-400 text-gray-900">
            <button (click)="search()" class="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all active:scale-95">
              Buscar
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2 ml-1">Ex: "Maria", "000.111.222-33" ou número do protocolo.</p>
        </div>

        <!-- Results -->
        @if (searched()) {
           <div class="animate-fade-in">
             <!-- Advanced Local Filter (Secondary) -->
             @if (myBookings().length > 0) {
               <div class="mb-6">
                 <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input type="text" 
                           [ngModel]="localFilter()" 
                           (ngModelChange)="localFilter.set($event)"
                           placeholder="Filtrar resultados..." 
                           class="block w-full pl-10 pr-3 py-3 rounded-xl border-gray-200 bg-white shadow-sm border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm">
                 </div>
               </div>
             }

             <div class="space-y-6">
               @for (booking of filteredBookings(); track booking.id) {
                 @let editable = booking.status === 'PENDENTE';

                 <!-- Ticket Card Design -->
                 <div class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                   <!-- Status Bar -->
                   <div [class]="'h-1.5 w-full ' + 
                      (booking.status === 'CONCLUIDO' ? 'bg-green-500' : 
                       (booking.status === 'CANCELADO' ? 'bg-red-500' : 'bg-brand-500'))">
                   </div>
                   
                   <div class="p-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                     <div class="flex-1">
                       <div class="flex items-center gap-2 mb-1">
                          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Protocolo</span>
                          <span class="text-xs font-mono text-gray-500">{{ booking.id }}</span>
                       </div>
                       <h3 class="text-xl font-bold text-gray-900 mb-2">{{ booking.service_type }}</h3>
                       <p class="text-sm text-gray-600 mb-4 flex items-center gap-1">
                          <span class="w-2 h-2 rounded-full bg-accent-500 inline-block"></span>
                          {{ booking.zone === 'RURAL' ? 'Zona Rural' : 'Zona Urbana' }}
                       </p>
                       
                       <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 inline-flex">
                          <div class="flex items-center gap-1 text-gray-700 font-semibold">
                            <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            {{ booking.date | date:'dd/MM' }}
                          </div>
                          <div class="h-4 w-px bg-gray-300"></div>
                          <div class="flex items-center gap-1 text-gray-700 font-semibold">
                            <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {{ booking.time }}
                          </div>
                       </div>
                       
                       <div class="mt-3 text-sm text-gray-500">
                         <span class="font-bold">Nome:</span> {{ booking.name }} <br>
                         <span class="font-bold">Tel:</span> {{ booking.phone }}
                       </div>
                     </div>

                     <div class="flex flex-col items-end justify-between self-stretch">
                        <span [class]="'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ' + 
                          (booking.status === 'CONCLUIDO' ? 'bg-green-50 text-green-700 border-green-100' : 
                           (booking.status === 'CANCELADO' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'))">
                          {{ booking.status }}
                        </span>
                        
                        @if (editable) {
                           <button (click)="openEditModal(booking)" class="mt-4 px-4 py-3 text-sm text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 hover:border-brand-300 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 group/btn">
                             <div class="bg-white p-1 rounded-md text-brand-500 border border-brand-100 group-hover/btn:bg-brand-500 group-hover/btn:text-white group-hover/btn:border-brand-500 transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             </div>
                             Editar / Reagendar
                           </button>
                        } @else {
                           <span class="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wide bg-gray-100 px-2 py-1 rounded border border-gray-200 cursor-not-allowed">
                             Edição Bloqueada
                           </span>
                        }
                     </div>
                   </div>
                 </div>
               }
               
               @if (myBookings().length > 0 && filteredBookings().length === 0) {
                 <div class="text-center py-8 text-gray-500 text-sm bg-gray-100 rounded-xl border border-gray-200">
                   Nenhum agendamento encontrado para os termos pesquisados.
                 </div>
               }

               @if (myBookings().length === 0) {
                 <div class="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-200 border-dashed">
                   <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Nenhum agendamento encontrado para estes dados.
                 </div>
               }
             </div>
           </div>
        }
        
        <div class="mt-12 text-center">
           <a routerLink="/" class="text-brand-600 hover:text-brand-800 font-bold flex items-center justify-center gap-2 transition-colors">
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Voltar ao Início
           </a>
        </div>
      </div>
      
      <!-- Edit/Reschedule Modal -->
      @if (editingBooking()) {
        <!-- Fixed Overlay with High Z-Index -->
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/80 backdrop-blur-md p-4 animate-fade-in">
          
          <!-- Modal Container: Responsive Height & Scrolling -->
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh]">
             
             <!-- Header (Fixed) -->
             <div class="flex justify-between items-center p-6 sm:p-8 border-b border-gray-100 shrink-0">
                <h3 class="text-2xl font-black text-gray-900 tracking-tight">Editar Agendamento</h3>
                <button (click)="editingBooking.set(null)" class="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <!-- Body (Scrollable) -->
             <div class="p-6 sm:p-8 space-y-6 overflow-y-auto">
               <!-- Personal Data Section -->
               <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dados Pessoais</h4>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                      <input type="text" [(ngModel)]="editForm.name" class="block w-full rounded-lg border-gray-300 border p-3 focus:ring-brand-500 focus:border-brand-500 bg-white focus:bg-white text-sm font-medium shadow-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                      <input type="text" 
                              [(ngModel)]="editForm.phone" 
                              (input)="onPhoneInputEdit($event)"
                              maxlength="15"
                              class="block w-full rounded-lg border-gray-300 border p-3 focus:ring-brand-500 focus:border-brand-500 bg-white focus:bg-white text-sm font-medium shadow-sm font-mono">
                    </div>
                  </div>
               </div>

               <!-- Reschedule Section -->
               <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <h4 class="text-xs font-bold text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Data e Horário
                  </h4>
                  
                  <div class="mb-4">
                     <label class="block text-sm font-bold text-gray-700 mb-1">Escolha a Nova Data</label>
                     <input type="date" 
                            [(ngModel)]="editForm.date" 
                            (change)="onDateChange()"
                            [min]="minDate"
                            class="block w-full rounded-lg border-brand-200 border p-3 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm text-brand-900 font-bold">
                     <p class="text-xs text-gray-500 mt-1">Agendamentos permitidos apenas a partir de amanhã.</p>
                  </div>

                  @if (editForm.date) {
                    <div>
                       <label class="block text-sm font-bold text-gray-700 mb-2">Horários Disponíveis ({{ editingBooking()?.zone }})</label>
                       @if (modalSlots().length === 0) {
                          <div class="text-center p-4 bg-white border border-red-200 rounded-lg text-red-600 text-sm font-bold shadow-sm">
                            Sem vagas para esta data.
                          </div>
                       } @else {
                          <div class="grid grid-cols-4 gap-2">
                             @for (slot of modalSlots(); track slot.time) {
                                <button (click)="editForm.time = slot.time"
                                   [class]="'py-2 rounded-lg text-xs font-bold border transition-all shadow-sm ' + 
                                   (editForm.time === slot.time ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-300 ring-offset-1' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-600')">
                                   {{ slot.time }}
                                </button>
                             }
                          </div>
                       }
                    </div>
                  }
               </div>
             </div>

             <!-- Footer (Fixed at bottom of modal) -->
             <div class="p-6 sm:p-8 pt-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-3xl shrink-0">
               <button (click)="editingBooking.set(null)" class="px-5 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors">Cancelar</button>
               <button (click)="saveEdit()" 
                       [disabled]="!editForm.name || !editForm.phone || !editForm.date || !editForm.time"
                       class="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-1">
                 Confirmar
               </button>
             </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MyBookingsComponent {
  dataService = inject(DataService);
  searchTerm = '';
  myBookings = signal<Booking[]>([]);
  searched = signal(false);

  // Advanced Filter
  localFilter = signal('');

  editingBooking = signal<Booking | null>(null);
  editForm = { name: '', phone: '', date: '', time: '' };
  modalSlots = signal<{ time: string, available: boolean }[]>([]);
  minDate = '';

  constructor() {
    // Calculate Tomorrow for minDate attribute (Block "Same Day" rule)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
  }

  // Computed signal for local filtering
  filteredBookings = computed(() => {
    const term = this.localFilter().toLowerCase();
    const list = this.myBookings();

    if (!term) return list;

    return list.filter(b =>
      b.name.toLowerCase().includes(term) ||
      b.phone.includes(term) ||
      b.id.toLowerCase().includes(term)
    );
  });

  onPhoneInputEdit(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, '($1');
    }
    this.editForm.phone = value;
  }

  search() {
    if (!this.searchTerm.trim()) return;

    const term = this.searchTerm.toLowerCase().trim();
    const termDigits = term.replace(/\D/g, '');

    const results = this.dataService.bookings().filter(b => {
      // 1. Match Protocol (ID) - Case insensitive substring
      if (b.id.toLowerCase().includes(term)) return true;

      // 2. Match Name - Case insensitive substring
      if (b.name.toLowerCase().includes(term)) return true;

      // 3. Match CPF (Digits)
      const cpfDigits = b.cpf.replace(/\D/g, '');
      if (termDigits.length >= 3 && cpfDigits.includes(termDigits)) return true;

      // 4. Match Phone (Digits)
      const phoneDigits = b.phone.replace(/\D/g, '');
      if (termDigits.length >= 4 && phoneDigits.includes(termDigits)) return true;

      return false;
    });

    this.myBookings.set(results);
    this.searched.set(true);
    this.localFilter.set('');
  }

  openEditModal(booking: Booking) {
    this.editForm = {
      name: booking.name,
      phone: booking.phone,
      date: booking.date,
      time: booking.time
    };
    this.editingBooking.set(booking);
    this.loadSlotsForModal();
  }

  onDateChange() {
    this.editForm.time = ''; // Reset time when date changes
    this.loadSlotsForModal();
  }

  loadSlotsForModal() {
    const booking = this.editingBooking();
    if (!booking || !this.editForm.date) return;

    if (this.dataService.isDateBlocked(this.editForm.date, booking.service_type)) {
      this.modalSlots.set([]);
      return;
    }

    // Get slots. Note: getSlotsForDateAndZone usually excludes taken slots.
    const slots = this.dataService.getSlotsForDateAndZone(this.editForm.date, booking.zone);

    // Logic: If the selected date is the SAME as the original booking date,
    // we must manually ADD the original time back to the list of available slots
    // because getSlotsForDateAndZone sees it as "taken" by the current user.
    if (this.editForm.date === booking.date) {
      const isTimeInList = slots.some(s => s.time === booking.time);
      if (!isTimeInList) {
        slots.push({ time: booking.time, available: true });
        // Sort slots by time
        slots.sort((a, b) => a.time.localeCompare(b.time));
      }
    }

    this.modalSlots.set(slots);
  }

  async saveEdit() {
    const booking = this.editingBooking();
    if (booking && this.editForm.name && this.editForm.phone && this.editForm.date && this.editForm.time) {

      const result = await this.dataService.updateBookingFull(booking.id, {
        name: this.editForm.name,
        phone: this.editForm.phone,
        date: this.editForm.date,
        time: this.editForm.time
      });

      if (result.success) {
        this.editingBooking.set(null);
        this.search(); // Refresh list
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  }
}