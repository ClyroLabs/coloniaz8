import { Injectable, signal } from '@angular/core';
import { supabase } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<User | null>(null);
  readonly session = signal<Session | null>(null);

  constructor() {
    this.init();
  }

  private async init() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      this.session.set(data.session);
      this.currentUser.set(data.session.user);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async logout() {
    await supabase.auth.signOut();
    this.session.set(null);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }
}
