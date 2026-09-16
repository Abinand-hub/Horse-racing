import { Banner, Bet, BetType, Race, RaceStatus, Transaction, User } from '../types';
import { DUMMY_BANNERS, DUMMY_BETS, DUMMY_RACES, DUMMY_USER } from '../data/dummyMatches';

const API_BASE = '/api';

export const api = {
  // Auth
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; simulated_otp?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      return data;
    } catch {
      return { success: true, message: `OTP sent to ${phone}`, simulated_otp: '123456' };
    }
  },

  async signup(params: { phone: string; otp: string; username: string; password: string }): Promise<{ user: User; token: string }> {
    try {
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
    } catch {
      const fallbackUser: User = {
        ...DUMMY_USER,
        id: `usr_${Date.now()}`,
        username: params.username,
        phone: params.phone,
        full_name: params.username,
      };
      localStorage.setItem('derby_token', `token_${fallbackUser.id}`);
      localStorage.setItem('derby_user', JSON.stringify(fallbackUser));
      return { user: fallbackUser, token: `token_${fallbackUser.id}` };
    }
  },

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
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
    } catch {
      const fallbackUser: User = {
        ...DUMMY_USER,
        username: username || DUMMY_USER.username,
      };
      localStorage.setItem('derby_token', `token_${fallbackUser.id}`);
      localStorage.setItem('derby_user', JSON.stringify(fallbackUser));
      return { user: fallbackUser, token: `token_${fallbackUser.id}` };
    }
  },

  async getMe(userId?: string): Promise<User> {
    try {
      const token = localStorage.getItem('derby_token') || '';
      const query = userId ? `?user_id=${userId}` : '';
      const res = await fetch(`${API_BASE}/auth/me${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('derby_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (e) {
      console.warn('API getMe failed, using cached or fallback user', e);
    }
    const saved = localStorage.getItem('derby_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DUMMY_USER;
  },

  async changePassword(user_id: string, current_password: string, new_password: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, current_password, new_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');
    } catch (e: any) {
      console.warn('Change password fallback:', e);
    }
  },

  logout() {
    localStorage.removeItem('derby_token');
    localStorage.removeItem('derby_user');
  },

  // Races
  async getRaces(status?: 'upcoming' | 'open' | 'live' | 'resulted' | 'all'): Promise<Race[]> {
    let customRaces: Race[] = [];
    try {
      const raw = localStorage.getItem('derby_custom_races');
      if (raw) customRaces = JSON.parse(raw);
    } catch {}

    try {
      const query = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/races${query}`);
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data.races) && data.races.length > 0) {
            // Merge custom races from localStorage if not present
            const remoteMap = new Map(data.races.map((r: Race) => [r.id, r]));
            for (const cr of customRaces) {
              if (!remoteMap.has(cr.id)) {
                data.races.unshift(cr);
              }
            }
            if (status === 'live') {
              return data.races.filter((r: Race) => r.status === 'LIVE');
            } else if (status === 'open') {
              return data.races.filter((r: Race) => r.status === 'OPEN' || r.status === 'UPCOMING' || r.status === 'LIVE');
            } else if (status === 'upcoming') {
              return data.races.filter((r: Race) => r.status === 'UPCOMING' || r.status === 'OPEN' || r.status === 'DRAFT');
            } else if (status === 'resulted') {
              return data.races.filter((r: Race) => r.status === 'RESULTED' || r.status === 'CLOSED');
            }
            return data.races;
          }
        } catch {}
      }
    } catch (e) {
      console.warn('API getRaces failed, using local/dummy matches:', e);
    }
    
    // Combine custom races with dummy races
    const allRaces = [...customRaces, ...DUMMY_RACES.filter((dr) => !customRaces.some((cr) => cr.id === dr.id))];

    if (status === 'live') {
      return allRaces.filter((r) => r.status === 'LIVE');
    } else if (status === 'open') {
      return allRaces.filter((r) => r.status === 'OPEN' || r.status === 'UPCOMING' || r.status === 'LIVE');
    } else if (status === 'upcoming') {
      return allRaces.filter((r) => r.status === 'UPCOMING' || r.status === 'OPEN' || r.status === 'DRAFT');
    } else if (status === 'resulted') {
      return allRaces.filter((r) => r.status === 'RESULTED' || r.status === 'CLOSED');
    }
    return allRaces;
  },

  async getRace(id: string): Promise<Race> {
    try {
      const res = await fetch(`${API_BASE}/races/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.race) return data.race;
      }
    } catch {}

    try {
      const raw = localStorage.getItem('derby_custom_races');
      if (raw) {
        const customRaces: Race[] = JSON.parse(raw);
        const foundCustom = customRaces.find((r) => r.id === id);
        if (foundCustom) return foundCustom;
      }
    } catch {}

    const found = DUMMY_RACES.find((r) => r.id === id);
    if (found) return found;
    return DUMMY_RACES[0];
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
    let currentUser: User = DUMMY_USER;
    try {
      const saved = localStorage.getItem('derby_user');
      if (saved) currentUser = JSON.parse(saved);
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/bets/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('derby_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch {}

    const allRaces = await this.getRaces('all');
    const race = allRaces.find((r) => r.id === params.race_id) || allRaces[0];
    const horse = race?.horses?.find((h) => h.id === params.horse_id) || race?.horses?.[0] || {
      id: params.horse_id,
      horse_no: 1,
      serial_no: 1,
      gate_no: 1,
      name: 'Thoroughbred',
      jockey: 'Jockey',
      trainer: 'Trainer',
    };

    const newBet: Bet = {
      id: `bet_${Date.now()}`,
      user_id: params.user_id,
      username: currentUser.username || 'arjun_punters',
      race_id: race.id,
      race_name: race.name,
      venue: race.venue,
      horse_id: horse.id,
      horse_name: horse.name,
      horse_no: horse.horse_no,
      serial_no: horse.serial_no || horse.horse_no,
      gate_no: horse.gate_no || 1,
      jockey: horse.jockey,
      trainer: horse.trainer,
      bet_type: params.bet_type,
      odds: params.odds,
      stake: params.stake,
      potential_win: Math.round(params.stake * params.odds),
      payout: 0,
      status: 'PENDING',
      placed_at: new Date().toISOString(),
      settled_at: null,
    };

    // Save to local bets
    try {
      const rawBets = localStorage.getItem('derby_custom_bets');
      const betsList: Bet[] = rawBets ? JSON.parse(rawBets) : [];
      betsList.unshift(newBet);
      localStorage.setItem('derby_custom_bets', JSON.stringify(betsList));
    } catch {}

    const updatedUser: User = {
      ...currentUser,
      balance: Math.max(0, (currentUser.balance ?? 5000) - params.stake),
      exposure: (currentUser.exposure ?? 0) + params.stake,
    };
    localStorage.setItem('derby_user', JSON.stringify(updatedUser));

    // Save transaction
    try {
      const rawTx = localStorage.getItem('derby_custom_txs');
      const txs: Transaction[] = rawTx ? JSON.parse(rawTx) : [];
      txs.unshift({
        id: `tx_${Date.now()}`,
        user_id: params.user_id,
        type: 'BET',
        amount: -params.stake,
        balance_after: updatedUser.balance,
        description: `Bet placed on #${horse.horse_no} ${horse.name} (${params.bet_type} @ ${params.odds}x)`,
        created_at: new Date().toISOString(),
        reference_id: newBet.id,
      });
      localStorage.setItem('derby_custom_txs', JSON.stringify(txs));
    } catch {}

    return {
      message: 'Bet placed successfully!',
      bet: newBet,
      user: updatedUser,
    };
  },

  async getMyBets(userId: string): Promise<Bet[]> {
    let localBets: Bet[] = [];
    try {
      const raw = localStorage.getItem('derby_custom_bets');
      if (raw) localBets = JSON.parse(raw);
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/bets/my?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bets)) {
          return [...localBets, ...data.bets.filter((db: Bet) => !localBets.some((lb) => lb.id === db.id))];
        }
      }
    } catch {}
    return [...localBets, ...DUMMY_BETS];
  },

  // Wallet
  async deposit(userId: string, amount: number, payment_method: string): Promise<{ user: User; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount, payment_method }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('derby_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch {}

    let currentUser: User = DUMMY_USER;
    try {
      const saved = localStorage.getItem('derby_user');
      if (saved) currentUser = JSON.parse(saved);
    } catch {}

    const updatedUser: User = {
      ...currentUser,
      balance: (currentUser.balance ?? 5000) + amount,
    };
    localStorage.setItem('derby_user', JSON.stringify(updatedUser));

    try {
      const rawTx = localStorage.getItem('derby_custom_txs');
      const txs: Transaction[] = rawTx ? JSON.parse(rawTx) : [];
      txs.unshift({
        id: `tx_${Date.now()}`,
        user_id: userId,
        type: 'DEPOSIT',
        amount: amount,
        balance_after: updatedUser.balance,
        description: `Wallet Deposit via ${payment_method || 'Dummy Money / UPI'}`,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('derby_custom_txs', JSON.stringify(txs));
    } catch {}

    return {
      user: updatedUser,
      message: 'Deposit successful!',
    };
  },

  async withdraw(userId: string, amount: number, details: { upi_id?: string; bank_account?: string }): Promise<{ user: User; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount, ...details }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('derby_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch {}

    let currentUser: User = DUMMY_USER;
    try {
      const saved = localStorage.getItem('derby_user');
      if (saved) currentUser = JSON.parse(saved);
    } catch {}

    const updatedUser: User = {
      ...currentUser,
      balance: Math.max(0, (currentUser.balance ?? 5000) - amount),
    };
    localStorage.setItem('derby_user', JSON.stringify(updatedUser));

    try {
      const rawTx = localStorage.getItem('derby_custom_txs');
      const txs: Transaction[] = rawTx ? JSON.parse(rawTx) : [];
      txs.unshift({
        id: `tx_${Date.now()}`,
        user_id: userId,
        type: 'WITHDRAW',
        amount: -amount,
        balance_after: updatedUser.balance,
        description: `Withdrawal request to ${details.upi_id || details.bank_account || 'Bank'}`,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('derby_custom_txs', JSON.stringify(txs));
    } catch {}

    return {
      user: updatedUser,
      message: 'Withdrawal submitted successfully',
    };
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    let localTxs: Transaction[] = [];
    try {
      const raw = localStorage.getItem('derby_custom_txs');
      if (raw) localTxs = JSON.parse(raw);
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/wallet/transactions?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          return [...localTxs, ...data.transactions.filter((t: Transaction) => !localTxs.some((lt) => lt.id === t.id))];
        }
      }
    } catch {}

    if (localTxs.length > 0) return localTxs;

    return [
      {
        id: 'tx_01',
        user_id: userId,
        type: 'DEPOSIT',
        amount: 5000,
        balance_after: 5000,
        description: 'Initial Wallet Deposit via UPI',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'tx_02',
        user_id: userId,
        type: 'WIN',
        amount: 1300,
        balance_after: 6300,
        description: 'Payout: Mystic Bay won Mysore 1000 Guineas (Odds 2.60)',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    let customBanners: Banner[] = [];
    try {
      const raw = localStorage.getItem('derby_custom_banners');
      if (raw) customBanners = JSON.parse(raw);
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/banners`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.banners) && data.banners.length > 0) {
          return [...customBanners, ...data.banners.filter((b: Banner) => !customBanners.some((cb) => cb.id === b.id))];
        }
      }
    } catch {}
    return [...customBanners, ...DUMMY_BANNERS];
  },

  async createBanner(banner: Partial<Banner>): Promise<Banner> {
    const newBanner: Banner = {
      id: `bnr_${Date.now()}`,
      title: banner.title || 'Special Promotion',
      subtitle: banner.subtitle || 'Place bets on upcoming racing fixtures',
      image_url: banner.image_url || '/images/race_action.jpg',
      link: banner.link || '#/',
      tag: banner.tag || 'SPECIAL',
      is_active: true,
    };

    try {
      const res = await fetch(`${API_BASE}/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.banner) return data.banner;
      }
    } catch {}

    try {
      const raw = localStorage.getItem('derby_custom_banners');
      const list: Banner[] = raw ? JSON.parse(raw) : [];
      list.unshift(newBanner);
      localStorage.setItem('derby_custom_banners', JSON.stringify(list));
    } catch {}

    return newBanner;
  },

  async deleteBanner(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
    } catch {}
    try {
      const raw = localStorage.getItem('derby_custom_banners');
      if (raw) {
        const list: Banner[] = JSON.parse(raw);
        localStorage.setItem('derby_custom_banners', JSON.stringify(list.filter((b) => b.id !== id)));
      }
    } catch {}
  },

  // Admin
  async getAdminOverview(): Promise<{
    totalUsers: number;
    totalBets: number;
    totalVolume: number;
    openRaces: number;
    pendingBetsCount: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`);
      if (res.ok) {
        const data = await res.json();
        if (data.stats) return data.stats;
      }
    } catch {}

    const races = await this.getRaces('all');
    return {
      totalUsers: 8,
      totalBets: 24,
      totalVolume: 125000,
      openRaces: races.filter((r) => r.status === 'OPEN').length,
      pendingBetsCount: 6,
    };
  },

  async createRace(raceData: any): Promise<Race> {
    const raceId = `race_custom_${Date.now()}`;
    const parsedHorses = (raceData.horses || []).map((h: any, index: number) => {
      const sNo = Number(h.serial_no || h.horse_no) || index + 1;
      const gNo = h.gate_no !== undefined && h.gate_no !== '' ? (isNaN(Number(h.gate_no)) ? h.gate_no : Number(h.gate_no)) : (index + 1);
      return {
        id: h.id || `hrs_${raceId}_${index + 1}`,
        race_id: raceId,
        horse_no: sNo,
        serial_no: sNo,
        gate_no: gNo,
        name: String(h.name || `Horse ${sNo}`).trim(),
        jockey: String(h.jockey || 'Jockey TBD').trim(),
        trainer: String(h.trainer || 'Trainer TBD').trim(),
        win_odds: Math.max(1.01, Number(h.win_odds) || 2.5),
        place_odds: Math.max(1.01, Number(h.place_odds) || 1.4),
        silk_color: h.silk_color || ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#e11d48'][index % 7],
        form: h.form || '1-1-2-1',
        weight: h.weight || '56.0 kg',
      };
    });

    const newRace: Race = {
      id: raceId,
      name: String(raceData.name).trim(),
      race_no: raceData.race_no ? Number(raceData.race_no) : undefined,
      venue: String(raceData.venue || 'Bangalore Turf Club').trim(),
      race_time: String(raceData.race_time || '2:00 PM').trim(),
      date_str: String(raceData.date_str || 'Today, 5th Sep').trim(),
      distance: String(raceData.distance || '1600m').trim(),
      going: String(raceData.going || 'Good').trim(),
      class_grade: String(raceData.class_grade || 'Grade 1 • Terms').trim(),
      status: raceData.status || 'OPEN',
      image_url: raceData.image_url || '/images/race_action.jpg',
      winner_horse_id: null,
      place_horses_ids: [],
      horses: parsedHorses,
      settled_at: null,
    };

    try {
      const res = await fetch(`${API_BASE}/admin/races`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raceData),
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.race) {
            this.saveLocalRace(data.race);
            return data.race;
          }
        } catch {}
      }
    } catch (e) {
      console.warn('API createRace network notice:', e);
    }

    this.saveLocalRace(newRace);
    return newRace;
  },

  saveLocalRace(race: Race) {
    try {
      const raw = localStorage.getItem('derby_custom_races');
      const list: Race[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((r) => r.id === race.id);
      if (idx >= 0) {
        list[idx] = race;
      } else {
        list.unshift(race);
      }
      localStorage.setItem('derby_custom_races', JSON.stringify(list));
    } catch {}
  },

  async updateRace(raceId: string, raceData: any): Promise<Race> {
    try {
      const res = await fetch(`${API_BASE}/admin/races/${raceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raceData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.race) {
          this.saveLocalRace(data.race);
          return data.race;
        }
      }
    } catch {}

    const allRaces = await this.getRaces('all');
    const existing = allRaces.find((r) => r.id === raceId) || allRaces[0];
    const updatedRace: Race = {
      ...existing,
      ...raceData,
      horses: raceData.horses || existing.horses,
    };
    this.saveLocalRace(updatedRace);
    return updatedRace;
  },

  async deleteRace(raceId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/races/${raceId}`, {
        method: 'DELETE',
      });
    } catch {}

    try {
      const raw = localStorage.getItem('derby_custom_races');
      if (raw) {
        const list: Race[] = JSON.parse(raw);
        localStorage.setItem('derby_custom_races', JSON.stringify(list.filter((r) => r.id !== raceId)));
      }
    } catch {}
  },

  async updateRaceStatus(raceId: string, status: RaceStatus): Promise<Race> {
    try {
      const res = await fetch(`${API_BASE}/admin/races/${raceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.race) {
          this.saveLocalRace(data.race);
          return data.race;
        }
      }
    } catch {}

    const allRaces = await this.getRaces('all');
    const race = allRaces.find((r) => r.id === raceId) || allRaces[0];
    const updated = { ...race, status };
    this.saveLocalRace(updated);
    return updated;
  },

  async publishRace(raceId: string): Promise<Race> {
    return this.updateRaceStatus(raceId, 'OPEN');
  },

  async updateHorseOdds(horseId: string, win_odds?: number, place_odds?: number): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/horses/${horseId}/odds`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ win_odds, place_odds }),
      });
    } catch {}

    const allRaces = await this.getRaces('all');
    for (const r of allRaces) {
      const h = r.horses?.find((item) => item.id === horseId);
      if (h) {
        if (win_odds !== undefined && !isNaN(win_odds)) h.win_odds = Number(win_odds);
        if (place_odds !== undefined && !isNaN(place_odds)) h.place_odds = Number(place_odds);
        this.saveLocalRace(r);
        break;
      }
    }
  },

  async settleRace(raceId: string, winner_horse_id: string, place_horses_ids: string[]): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/races/${raceId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_horse_id, place_horses_ids }),
      });
      if (res.ok) {
        const data = await res.json();
        // Server response received
      }
    } catch {}

    const allRaces = await this.getRaces('all');
    const race = allRaces.find((r) => r.id === raceId);
    
    const placeList: string[] = Array.isArray(place_horses_ids) && place_horses_ids.length > 0
      ? [...place_horses_ids]
      : [winner_horse_id];
    if (!placeList.includes(winner_horse_id)) {
      placeList.unshift(winner_horse_id);
    }

    if (race) {
      race.winner_horse_id = winner_horse_id;
      race.place_horses_ids = placeList;
      race.status = 'RESULTED';
      race.settled_at = new Date().toISOString();
      this.saveLocalRace(race);
    }

    // Process all bets for this race
    let localBets: Bet[] = [];
    try {
      const raw = localStorage.getItem('derby_custom_bets');
      if (raw) localBets = JSON.parse(raw);
    } catch {}

    let currentUser: User = DUMMY_USER;
    try {
      const savedUser = localStorage.getItem('derby_user');
      if (savedUser) currentUser = JSON.parse(savedUser);
    } catch {}

    let localTxs: Transaction[] = [];
    try {
      const rawTxs = localStorage.getItem('derby_custom_txs');
      if (rawTxs) localTxs = JSON.parse(rawTxs);
    } catch {}

    let settledCount = 0;
    let totalPaidOut = 0;

    for (const bet of localBets) {
      const isRaceMatch = bet.race_id === raceId || (race && bet.race_name === race.name);
      if (isRaceMatch && bet.status === 'PENDING') {
        let isWon = false;
        if (bet.bet_type === 'WIN') {
          isWon = bet.horse_id === winner_horse_id;
        } else if (bet.bet_type === 'PLACE') {
          isWon = placeList.includes(bet.horse_id);
        }

        bet.settled_at = new Date().toISOString();

        if (isWon) {
          bet.status = 'WON';
          const payoutAmount = Math.round(bet.stake * bet.odds);
          bet.payout = payoutAmount;
          totalPaidOut += payoutAmount;

          // Credit balance & release exposure
          currentUser.balance = (currentUser.balance ?? 0) + payoutAmount;
          currentUser.exposure = Math.max(0, (currentUser.exposure ?? 0) - bet.stake);

          // Log WIN transaction
          localTxs.unshift({
            id: `tx_${Date.now()}_${bet.id}`,
            user_id: bet.user_id,
            type: 'WIN',
            amount: payoutAmount,
            balance_after: currentUser.balance,
            description: `Payout WON: ${bet.bet_type} bet on #${bet.horse_no} ${bet.horse_name} in ${race?.name || bet.race_name} (${bet.odds}x)`,
            created_at: new Date().toISOString(),
            reference_id: bet.id,
          });
        } else {
          bet.status = 'LOST';
          bet.payout = 0;
          // Release exposure on loss
          currentUser.exposure = Math.max(0, (currentUser.exposure ?? 0) - bet.stake);
        }
        settledCount++;
      }
    }

    // Save back to localStorage
    try {
      localStorage.setItem('derby_custom_bets', JSON.stringify(localBets));
      localStorage.setItem('derby_user', JSON.stringify(currentUser));
      localStorage.setItem('derby_custom_txs', JSON.stringify(localTxs));
    } catch {}

    const winnerName = race?.horses?.find((h) => h.id === winner_horse_id)?.name || 'Winner';

    return { 
      success: true, 
      message: `Race "${race?.name || 'Fixture'}" resulted with winner ${winnerName}! ${settledCount} bets settled (${totalPaidOut > 0 ? `₹${totalPaidOut.toLocaleString('en-IN')} paid out to wallet` : 'no winning bets'}).`,
      settledCount,
      totalPaidOut
    };
  },

  async getAdminUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) return data.users;
      }
    } catch {}
    return [
      DUMMY_USER,
      {
        id: 'usr_rahul',
        ref_id: 'usr_rahul',
        full_name: 'Rahul Varma',
        phone: '9845012345',
        email: 'rahul.varma@gmail.com',
        username: 'rahul_derby',
        password_hash: 'pass123',
        balance: 12500,
        exposure: 1500,
        role: 'user',
        profile_photo: 'https://api.dicebear.com/7.x/bottts/svg?seed=rahul_derby',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'usr_admin',
        ref_id: '100001',
        full_name: 'Turf Derby Master',
        phone: '9999988888',
        email: 'admin@derbybet.turf',
        username: 'admin',
        password_hash: 'admin123',
        balance: 50000,
        exposure: 0,
        role: 'admin',
        profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
    ];
  },

  async getAdminAllBets(): Promise<Bet[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/bets`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bets)) return data.bets;
      }
    } catch {}

    let customBets: Bet[] = [];
    try {
      const raw = localStorage.getItem('derby_custom_bets');
      if (raw) customBets = JSON.parse(raw);
    } catch {}
    return [...customBets, ...DUMMY_BETS];
  },

  async adjustUserBalance(userId: string, amount: number, type: 'CREDIT' | 'DEBIT', description?: string): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type, description }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) return data;
      }
    } catch {}

    return {
      success: true,
      message: `Successfully ${type === 'DEBIT' ? 'debited' : 'credited'} ₹${amount} for user`,
      user: {
        ...DUMMY_USER,
        balance: type === 'CREDIT' ? DUMMY_USER.balance + amount : Math.max(0, DUMMY_USER.balance - amount),
      },
    };
  },

  async resetDemo(): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/reset-demo`, { method: 'POST' });
    } catch {}
    localStorage.removeItem('derby_custom_races');
    localStorage.removeItem('derby_custom_bets');
    localStorage.removeItem('derby_custom_banners');
  },
};
