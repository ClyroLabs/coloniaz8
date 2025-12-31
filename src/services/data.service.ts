import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { supabase } from '../lib/supabaseClient';
import { AuthService } from './auth.service';

export interface Booking {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  service_type: 'DAE' | 'SEGURO'; // Changed to snake_case to match DB
  zone: 'RURAL' | 'URBANA';
  date: string; // ISO Date YYYY-MM-DD
  time: string;
  status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
  created_at: string; // Changed name and type for DB compatibility
}

// Helper to map DB to Frontend model if needed, but try to align them.
// We will use snake_case in interface to simplify.

export interface AdminUser {
  username: string;
  password: string;
  role: 'MASTER' | 'ADMIN';
  active: boolean; // New Soft Delete / Block Logic
}

export interface AppSettings {
  quotaRural: number;
  quotaUrban: number;
  whatsappNumber: string;
  autoCompleteMinutes: number; // Renamed from toleranceMinutes
}

interface AdminSession {
  username: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // --- STATE SIGNALS ---
  readonly bookings = signal<Booking[]>([]);
  readonly adminUsers = signal<AdminUser[]>([]);
  readonly currentUser = signal<AdminUser | null>(null);
  readonly settings = signal<AppSettings>({
    quotaRural: 15,
    quotaUrban: 15,
    whatsappNumber: '5583991176164',
    autoCompleteMinutes: 30
  });

  private readonly STORAGE_KEY_BOOKINGS = 'sga_bookings';
  private readonly STORAGE_KEY_SETTINGS = 'sga_settings';
  private readonly STORAGE_KEY_ADMINS = 'sga_admins';
  private readonly STORAGE_KEY_SESSION = 'sga_admin_session'; // New Session Key

  private readonly DEFAULT_ADMINS: AdminUser[] = [
    { username: 'admin1', password: 'Op1@Z8_Fish#Alpha99', role: 'ADMIN', active: true },
    { username: 'admin2', password: 'Op2@Z8_Net$Beta88', role: 'ADMIN', active: true },
    { username: 'admin3', password: 'Op3@Z8_Sea&Gamma77', role: 'ADMIN', active: true },
    { username: 'admin4', password: 'Op4@Z8_Boat*Delta66', role: 'ADMIN', active: true },
    { username: 'master', password: 'Z8#Mstr_Key!2024$Secure', role: 'MASTER', active: true }
  ];

  authService = inject(AuthService);

  constructor() {
    this.loadData();
    // Removed legacy session restore/auto-loop for now or keep auto-loop
    this.startAutoCompletionJob();

    // Sync DataService user with AuthService (Supabase)
    effect(() => {
      const sbUser = this.authService.currentUser();
      if (sbUser) {
        // Map Supabase User to AdminUser
        // Default role is ADMIN unless email is specific
        const role = (sbUser.email === 'master@coloniaz8.com' || sbUser.user_metadata?.['role'] === 'MASTER') ? 'MASTER' : 'ADMIN';

        this.currentUser.set({
          username: sbUser.email || 'Supabase User',
          password: '***', // Hidden
          role: role as 'MASTER' | 'ADMIN',
          active: true
        });
      } else {
        this.currentUser.set(null);
      }
    }, { allowSignalWrites: true });
  }

  private async loadData() {
    // Load Bookings from Supabase
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false }); // Limit if necessary

    if (error) {
      console.error('Error loading bookings from Supabase:', error);
      // Fallback to local storage (optional, or just empty)
      const storedBookings = localStorage.getItem(this.STORAGE_KEY_BOOKINGS);
      if (storedBookings) this.bookings.set(JSON.parse(storedBookings));
    } else if (data) {
      this.bookings.set(data as unknown as Booking[]);
    }

    // Load Settings (Keep Local or move to DB later)
    const storedSettings = localStorage.getItem(this.STORAGE_KEY_SETTINGS);
    if (storedSettings) {
      this.settings.set(JSON.parse(storedSettings));
    }
  }

  // --- SESSION MANAGEMENT (12 HOURS RULE) ---

  private restoreSession() {
    const sessionStr = localStorage.getItem(this.STORAGE_KEY_SESSION);
    if (sessionStr) {
      try {
        const session: AdminSession = JSON.parse(sessionStr);
        const now = Date.now();

        // Check if expired
        if (now < session.expiresAt) {
          // Find user and check if still active
          const user = this.adminUsers().find(u => u.username === session.username);
          if (user && user.active) {
            this.currentUser.set(user);
            return;
          }
        }
      } catch (e) {
        console.error('Invalid session data', e);
      }
    }
    // If we reach here, session is invalid, expired, or user blocked
    this.logout();
  }

  login(username: string, pass: string): boolean {
    const user = this.adminUsers().find(u => u.username === username && u.password === pass);

    // Check if user exists AND is active
    if (user && user.active) {
      this.currentUser.set({ ...user });

      // PERSIST SESSION (12 Hours)
      const twelveHours = 12 * 60 * 60 * 1000;
      const session: AdminSession = {
        username: user.username,
        expiresAt: Date.now() + twelveHours
      };
      localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(session));

      return true;
    }
    return false;
  }

  async logout() {
    await this.authService.logout();
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY_SESSION);
  }

  // --- AUTOMATION: AUTO COMPLETE RULE ---
  private startAutoCompletionJob() {
    setInterval(() => {
      this.checkAndAutoComplete();
    }, 60000); // Check every minute
  }

  /**
   * GOLDEN RULE: If Current Time > Scheduled Time + autoCompleteMinutes, 
   * the booking is automatically marked as 'CONCLUIDO'.
   */
  private checkAndAutoComplete() {
    const now = new Date();
    let hasChanges = false;
    const configMinutes = this.settings().autoCompleteMinutes || 30;

    const currentList = this.bookings();

    const updatedBookings = currentList.map(booking => {
      // Only process PENDING items
      if (booking.status !== 'PENDENTE') return booking;
      if (!booking.date || !booking.time) return booking;

      // Parse Booking Date/Time
      const [bYear, bMonth, bDay] = booking.date.split('-').map(Number);
      const [bHour, bMinute] = booking.time.split(':').map(Number);

      // Create Date Object
      const bookingDateTime = new Date(bYear, bMonth - 1, bDay, bHour, bMinute);

      // Add Configured Minutes Rule
      const autoCompletionTime = new Date(bookingDateTime.getTime() + (configMinutes * 60 * 1000));

      if (now.getTime() > autoCompletionTime.getTime()) {
        hasChanges = true;
        return { ...booking, status: 'CONCLUIDO' as const };
      }

      return booking;
    });

    if (hasChanges) {
      // Explicit Persistence
      localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
      this.bookings.set(updatedBookings);
    }
  }

  // --- BUSINESS LOGIC HELPERS ---

  /**
   * Validates if a date is blocked based on Global Rules AND Service Specific Rules
   */
  isDateBlocked(dateStr: string, service_type?: 'DAE' | 'SEGURO'): boolean {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    const month = date.getMonth();
    const d = date.getDate();
    const year = date.getFullYear();

    // 1. Global Calendar Boundaries
    if (year < 2024) return true;
    // Allow 2026 for the new rules
    if (year > 2026) return true;

    // 2. Global Weekly Rules (Weekends)
    if (day === 0 || day === 6) return true;

    // 3. Global Recess Rules (Dec 31 to Jan 06)
    if (month === 11 && d >= 31) return true;
    if (month === 0 && d <= 6) return true;

    // 4. Specific Holidays
    const holidays = ['2024-12-25', '2025-01-01', '2025-04-21', '2025-05-01', '2025-09-07', '2025-10-12', '2025-11-02', '2025-11-15', '2025-12-25'];
    if (holidays.includes(dateStr)) return true;

    // 5. SERVICE SPECIFIC RULES (2026)
    if (service_type) {
      // Rule 1: Seguro Defeso starts Jan 08, 2026
      if (service_type === 'SEGURO') {
        if (dateStr < '2026-01-08') return true;
      }

      // Rule 2: Guia DAE starts Jan 14, 2026
      if (service_type === 'DAE') {
        if (dateStr < '2026-01-14') return true;
      }
    }

    return false;
  }

  getSlotsForDateAndZone(dateStr: string, zone: 'RURAL' | 'URBANA'): { time: string, available: boolean }[] {
    const slots = [];
    let startHour = zone === 'RURAL' ? 8 : 13;
    let endHour = zone === 'RURAL' ? 12 : 17;

    for (let h = startHour; h < endHour; h++) {
      slots.push({ time: `${h.toString().padStart(2, '0')}:00`, available: true });
      slots.push({ time: `${h.toString().padStart(2, '0')}:20`, available: true });
      slots.push({ time: `${h.toString().padStart(2, '0')}:40`, available: true });
    }

    const bookingsOnDate = this.bookings().filter(b => b.date === dateStr && b.zone === zone && b.status !== 'CANCELADO');
    const limit = zone === 'RURAL' ? this.settings().quotaRural : this.settings().quotaUrban;

    if (bookingsOnDate.length >= limit) {
      return [];
    }

    return slots.map(slot => {
      const isTaken = bookingsOnDate.some(b => b.time === slot.time);
      return { ...slot, available: !isTaken };
    }).filter(s => s.available);
  }

  // --- ACTIONS WITH EXPLICIT PERSISTENCE ---

  async addBooking(booking: Omit<Booking, 'id' | 'status' | 'created_at'>): Promise<Booking> {
    // SECURITY/VALIDATION CHECK
    if (this.isDateBlocked(booking.date, booking.service_type)) {
      throw new Error('Data indisponível para este serviço.');
    }

    const newBooking: Booking = {
      ...booking,
      id: crypto.randomUUID().slice(0, 8).toUpperCase(),
      status: 'PENDENTE',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('bookings')
      .insert(newBooking);

    if (error) {
      console.error('Supabase Insert Error', error);
      throw new Error('Erro ao salvar agendamento no sistema.');
    }

    this.bookings.update(current => [newBooking, ...current]);

    return newBooking;
  }

  async addBookingsBatch(newBookings: Booking[]) {
    // prepare data with IDs
    const toInsert = newBookings.map(b => ({
      ...b,
      id: (b.id && b.id.length > 2) ? b.id : crypto.randomUUID().slice(0, 8).toUpperCase(),
      // ensure service_type is correct from CSV parse
    }));

    const { error } = await supabase.from('bookings').insert(toInsert);

    if (error) {
      console.error('Batch Insert Error', error);
      throw new Error('Erro ao importar dados.');
    }

    this.bookings.update(prev => [...prev, ...toInsert]);
  }

  updateBookingData(id: string, data: { name: string, phone: string }) {
    this.bookings.update(current => {
      const updated = current.map(b => b.id === id ? { ...b, name: data.name, phone: data.phone } : b);
      localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
      return updated;
    });
  }

  /**
   * FULL UPDATE: Handles Rescheduling (Slot Swap) AND Data Update
   */
  async updateBookingFull(id: string, data: { name: string, phone: string, date: string, time: string }): Promise<{ success: boolean, message: string }> {
    const currentBookings = this.bookings();
    const bookingToUpdate = currentBookings.find(b => b.id === id);

    if (!bookingToUpdate) return { success: false, message: 'Agendamento não encontrado' };

    // 1. Validate Date Block (Including Service Type Rule)
    if (this.isDateBlocked(data.date, bookingToUpdate.service_type)) {
      return { success: false, message: 'A data selecionada está bloqueada para este tipo de serviço.' };
    }

    // 2. Validate Quota (If Date Changed)
    if (bookingToUpdate.date !== data.date) {
      const limit = bookingToUpdate.zone === 'RURAL' ? this.settings().quotaRural : this.settings().quotaUrban;
      const bookingsOnTargetDate = currentBookings.filter(b =>
        b.date === data.date &&
        b.zone === bookingToUpdate.zone &&
        b.status !== 'CANCELADO'
      ).length;

      if (bookingsOnTargetDate >= limit) {
        return { success: false, message: 'Limite de vagas excedido para a nova data.' };
      }
    }

    // 3. Validate Slot Availability
    const slotTaken = currentBookings.some(b =>
      b.date === data.date &&
      b.time === data.time &&
      b.status !== 'CANCELADO' &&
      b.id !== id // Ignore self
    );

    if (slotTaken) {
      return { success: false, message: 'O horário selecionado já está ocupado.' };
    }

    // 4. Perform Update
    const { error } = await supabase
      .from('bookings')
      .update({
        name: data.name,
        phone: data.phone,
        date: data.date,
        time: data.time
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase Update Error', error);
      return { success: false, message: 'Erro ao atualizar no banco de dados.' };
    }

    this.bookings.update(current => {
      return current.map(b => b.id === id ? {
        ...b,
        name: data.name,
        phone: data.phone,
        date: data.date,
        time: data.time
      } : b);
    });

    return { success: true, message: 'Agendamento atualizado com sucesso!' };
  }

  async rescheduleBooking(id: string, newDate: string, newTime: string): Promise<{ success: boolean, message: string }> {
    // Kept for Admin compatibility, delegates to Full Update using existing name/phone
    const booking = this.bookings().find(b => b.id === id);
    if (!booking) return { success: false, message: 'Agendamento não encontrado' };

    return this.updateBookingFull(id, {
      name: booking.name,
      phone: booking.phone,
      date: newDate,
      time: newTime
    });
  }

  // --- ADMIN SETTINGS ---

  updateSettings(newSettings: AppSettings) {
    localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    this.settings.set(newSettings);
  }

  updateUserPassword(newPass: string) {
    const current = this.currentUser();
    if (!current) return;
    current.password = newPass;

    this.currentUser.set(current);

    this.adminUsers.update(users => {
      const updated = users.map(u => u.username === current.username ? { ...u, password: newPass } : u);
      localStorage.setItem(this.STORAGE_KEY_ADMINS, JSON.stringify(updated));
      return updated;
    });
  }

  // REFACTORED: Soft Block instead of Delete
  toggleAdminStatus(username: string) {
    if (username === 'master') return; // Master cannot be blocked
    if (this.currentUser()?.username === username) return; // Cannot block self

    this.adminUsers.update(users => {
      const updated = users.map(u => {
        if (u.username === username) {
          return { ...u, active: !u.active }; // Toggle state
        }
        return u;
      });
      // Explicit Save
      localStorage.setItem(this.STORAGE_KEY_ADMINS, JSON.stringify(updated));
      return updated;
    });
  }

  async deleteAllBookings() {
    const { error } = await supabase.from('bookings').delete().neq('id', '0'); // Delete all
    if (error) {
      console.error('Delete All Error', error);
      throw new Error('Erro ao limpar banco de dados.');
    }
    this.bookings.set([]);
  }

  // --- EXPORT & IMPORT UTILS ---
  getCSVData(): string {
    const header = ['ID', 'Nome', 'CPF', 'Telefone', 'Servico', 'Zona', 'Data', 'Hora', 'Status'].join(';');
    const rows = this.bookings().map(b =>
      `${b.id};"${b.name}";${b.cpf};${b.phone};${b.service_type};${b.zone};${b.date};${b.time};${b.status}`
    );
    return [header, ...rows].join('\n');
  }

  parseCSVContent(csvText: string): Booking[] {
    const newBookings: Booking[] = [];
    try {
      const cleanText = csvText.replace(/^\uFEFF/, '');
      const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);

      if (lines.length < 2) return [];

      const firstLine = lines[0];
      const separator = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

      const headers = firstLine.split(separator).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

      const idxName = headers.findIndex(h => h.includes('nome') || h.includes('name'));
      const idxCpf = headers.findIndex(h => h.includes('cpf') || h.includes('doc'));
      const idxPhone = headers.findIndex(h => h.includes('tel') || h.includes('cel') || h.includes('phone'));
      const idxService = headers.findIndex(h => h.includes('servi') || h.includes('type'));
      const idxZone = headers.findIndex(h => h.includes('zona') || h.includes('zone'));
      const idxDate = headers.findIndex(h => h.includes('data') || h.includes('date'));
      const idxTime = headers.findIndex(h => h.includes('hora') || h.includes('time'));
      const idxStatus = headers.findIndex(h => h.includes('status'));

      const getCol = (cols: string[], idx: number, fallbackIdx: number) => {
        return (idx > -1 ? cols[idx] : cols[fallbackIdx]) || '';
      };

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(separator).map(c => c.replace(/^"|"$/g, '').trim());

        if (cols.length < 2) continue;

        const rawId = cols[0] ? cols[0].replace(/[^a-zA-Z0-9-]/g, '') : '';
        const finalId = (rawId.length > 2) ? rawId : crypto.randomUUID().slice(0, 8).toUpperCase();

        let dateVal = getCol(cols, idxDate, 6);
        let finalDate = '';

        const ptBrMatch = dateVal.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
        if (ptBrMatch) {
          const day = ptBrMatch[1].padStart(2, '0');
          const month = ptBrMatch[2].padStart(2, '0');
          const year = ptBrMatch[3];
          finalDate = `${year}-${month}-${day}`;
        } else {
          const isoMatch = dateVal.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
          if (isoMatch) {
            finalDate = dateVal;
          }
        }

        let timeVal = getCol(cols, idxTime, 7);
        let finalTime = '12:00';

        const timeMatch = timeVal.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const h = timeMatch[1].padStart(2, '0');
          const m = timeMatch[2];
          finalTime = `${h}:${m}`;
        } else if (!timeVal && finalDate) {
          finalTime = '12:00';
        }

        if (!finalDate) {
          finalDate = new Date().toISOString().split('T')[0];
        }

        newBookings.push({
          id: finalId,
          name: getCol(cols, idxName, 1) || 'Importado S/ Nome',
          cpf: getCol(cols, idxCpf, 2) || '',
          phone: getCol(cols, idxPhone, 3) || '',
          service_type: (getCol(cols, idxService, 4) as any) || 'DAE',
          zone: (getCol(cols, idxZone, 5) as any) || 'RURAL',
          date: finalDate,
          time: finalTime,
          status: (getCol(cols, idxStatus, 8) as any) || 'PENDENTE',
          created_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('CSV Parse Error', e);
      return [];
    }
    return newBookings;
  }
}