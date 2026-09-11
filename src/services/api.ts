import { Banner, Bet, BetType, Race, RaceStatus, Transaction, User } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; simulated_otp?: string }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  },

  async signup(params: { phone: string; otp: string; username: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign up failed');
    localStorage.setItem('derby_token', data.token);
    localStorage.setItem('derby_user', JSON.stringify(data.user));
    return data;
  },

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('derby_token', data.token);
    localStorage.setItem('derby_user', JSON.stringify(data.user));
    return data;
  },

  async getMe(userId?: string): Promise<User> {
    const token = localStorage.getItem('derby_token') || '';
    const query = userId ? `?user_id=${userId}` : '';
    const res = await fetch(`${API_BASE}/auth/me${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    localStorage.setItem('derby_user', JSON.stringify(data.user));
    return data.user;
  },

  async changePassword(user_id: string, current_password: string, new_password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, current_password, new_password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password update failed');
  },

  logout() {
    localStorage.removeItem('derby_token');
    localStorage.removeItem('derby_user');
  },

  // Races
  async getRaces(status?: 'upcoming' | 'open' | 'resulted' | 'all'): Promise<Race[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/races${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch races');
    return data.races;
  },

  async getRace(id: string): Promise<Race> {
    const res = await fetch(`${API_BASE}/races/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch race details');
    return data.race;
  },

  // Bets
  async placeBet(params: {
    race_id: string;
    horse_id: string;
    bet_type: BetType;
    odds: number;
    stake: number;
    user_id: string;
  }): Promise<{ message: string; bet: Bet; user: User }> {
    const res = await fetch(`${API_BASE}/bets/place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place bet');
    return data;
  },

  async getMyBets(userId: string): Promise<Bet[]> {
    const res = await fetch(`${API_BASE}/bets/my?user_id=${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch bets');
    return data.bets;
  },

  // Wallet
  async deposit(userId: string, amount: number, payment_method: string): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount, payment_method }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Deposit failed');
    return data;
  },

  async withdraw(userId: string, amount: number, details: { upi_id?: string; bank_account?: string }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount, ...details }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Withdrawal failed');
    return data;
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/wallet/transactions?user_id=${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch statement');
    return data.transactions;
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    const res = await fetch(`${API_BASE}/banners`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch banners');
    return data.banners;
  },

  async createBanner(banner: Partial<Banner>): Promise<Banner> {
    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add banner');
    return data.banner;
  },

  async deleteBanner(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete banner');
  },

  // Admin
  async getAdminOverview(): Promise<{
    totalUsers: number;
    totalBets: number;
    totalVolume: number;
    openRaces: number;
    pendingBetsCount: number;
  }> {
    const res = await fetch(`${API_BASE}/admin/overview`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load admin stats');
    return data.stats;
  },

  async createRace(raceData: any): Promise<Race> {
    const res = await fetch(`${API_BASE}/admin/races`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raceData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create race');
    return data.race;
  },

  async updateRace(raceId: string, raceData: any): Promise<Race> {
    const res = await fetch(`${API_BASE}/admin/races/${raceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raceData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update race');
    return data.race;
  },

  async deleteRace(raceId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/races/${raceId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete race');
  },

  async updateRaceStatus(raceId: string, status: RaceStatus): Promise<Race> {
    const res = await fetch(`${API_BASE}/admin/races/${raceId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update race status');
    return data.race;
  },

  async publishRace(raceId: string): Promise<Race> {
    const res = await fetch(`${API_BASE}/admin/races/${raceId}/publish`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to publish race');
    return data.race;
  },

  async updateHorseOdds(horseId: string, win_odds?: number, place_odds?: number): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/horses/${horseId}/odds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ win_odds, place_odds }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update odds');
  },

  async settleRace(raceId: string, winner_horse_id: string, place_horses_ids: string[]): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/races/${raceId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner_horse_id, place_horses_ids }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to settle race');
    return data;
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.users;
  },

  async getAdminAllBets(): Promise<Bet[]> {
    const res = await fetch(`${API_BASE}/admin/bets`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch bets');
    return data.bets;
  },

  async resetDemo(): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/reset-demo`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset demo');
  },
};
