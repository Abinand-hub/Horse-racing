import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3005;

app.use(express.json());

// In-memory + File Storage system
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface User {
  id: string;
  ref_id?: string;
  full_name?: string;
  phone: string;
  email?: string;
  username: string;
  password_hash: string;
  balance: number;
  exposure: number;
  role: 'user' | 'admin';
  profile_photo: string;
  created_at: string;
}

interface Horse {
  id: string;
  race_id: string;
  horse_no: number; // Serial number (S.No)
  serial_no?: number;
  gate_no?: number | string; // Gate number (Stall / Draw)
  name: string; // Name of the horse
  jockey: string; // Name of the jockey
  trainer: string; // Name of the trainer
  win_odds: number;
  place_odds: number;
  silk_color: string;
  form?: string;
  weight?: string;
  is_suspended?: boolean;
}

interface RaceCenter {
  id: string;
  name: string;
  code: string;
  city?: string;
  is_active: boolean;
  order?: number;
  created_at?: string;
}

interface RaceDay {
  id: string;
  center_id: string;
  center_name: string;
  race_date: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  races_count?: number;
  created_at?: string;
}

interface Race {
  id: string;
  race_day_id?: string;
  center_id?: string;
  name: string; // Name of the race / cup
  race_no?: number | string; // Race number
  race_number?: number | string;
  venue: string;
  race_time: string; // Time
  date_str: string;
  distance: string; // Distance
  going?: string;
  class_grade?: string;
  status: 'DRAFT' | 'UPCOMING' | 'OPEN' | 'LIVE' | 'CLOSED' | 'RESULTED' | 'OPEN_FOR_BETTING' | 'SUSPENDED';
  is_suspended?: boolean;
  image_url?: string;
  winner_horse_id: string | null;
  place_horses_ids: string[];
  position_1?: string[];
  position_2?: string[];
  position_3?: string[];
  is_dead_heat?: boolean;
  dead_heat_note?: string;
  horses: Horse[];
  settled_at: string | null;
}

interface Bet {
  id: string;
  user_id: string;
  username: string;
  race_id: string;
  race_name: string;
  venue: string;
  horse_id: string;
  horse_name: string;
  horse_no: number;
  serial_no?: number;
  gate_no?: number | string;
  jockey?: string;
  trainer?: string;
  bet_type: 'WIN' | 'PLACE';
  odds: number;
  stake: number;
  potential_win: number;
  payout: number;
  status: 'PENDING' | 'WON' | 'LOST';
  is_dead_heat?: boolean;
  dead_heat_divider?: number;
  placed_at: string;
  settled_at: string | null;
}

interface Transaction {
  id: string;
  user_id: string;
  username: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'REFUND';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  reference_id?: string;
}

export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface DepositRequest {
  id: string;
  user_id: string;
  username: string;
  amount: number;
  payment_method: string;
  utr_number: string;
  screenshot_url?: string;
  status: DepositStatus;
  admin_notes?: string;
  created_at: string;
  reviewed_at: string | null;
}

export type WithdrawalStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESSFUL' | 'REJECTED';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  username: string;
  amount: number;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
  account_holder?: string;
  status: WithdrawalStatus;
  admin_notes?: string;
  created_at: string;
  approved_at: string | null;
  completed_at: string | null;
  estimated_minutes?: number;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  tag: string;
  is_active: boolean;
}

interface DBData {
  users: User[];
  race_centers: RaceCenter[];
  race_days: RaceDay[];
  races: Race[];
  bets: Bet[];
  transactions: Transaction[];
  deposit_requests: DepositRequest[];
  withdrawal_requests: WithdrawalRequest[];
  banners: Banner[];
  otps: Record<string, { code: string; expires_at: number }>;
}

const defaultData: DBData = {
  users: [
    {
      id: 'usr_arjun',
      ref_id: 'usr_arjun',
      full_name: 'Arjun Kumar',
      phone: '9876543210',
      email: 'arjun.punters@gmail.com',
      username: 'arjun_punters',
      password_hash: 'pass123',
      balance: 5000,
      exposure: 0,
      role: 'user',
      profile_photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'usr_admin',
      ref_id: '100001',
      full_name: 'Turf Derby Master',
      phone: '9999988888',
      email: 'admin@derbybet.turf',
      username: 'derby_admin',
      password_hash: 'admin123',
      balance: 50000,
      exposure: 0,
      role: 'admin',
      profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ],
  deposit_requests: [
    {
      id: 'dep_01',
      user_id: 'usr_arjun',
      username: 'arjun_punters',
      amount: 5000,
      payment_method: 'UPI (PhonePe)',
      utr_number: '329845729104',
      screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      status: 'APPROVED',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000 + 120000).toISOString(),
    }
  ],
  withdrawal_requests: [
    {
      id: 'wth_01',
      user_id: 'usr_arjun',
      username: 'arjun_punters',
      amount: 2000,
      upi_id: 'arjun@okaxis',
      status: 'PENDING',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      approved_at: null,
      completed_at: null,
      estimated_minutes: 120,
    }
  ],
  race_centers: [
    { id: 'cntr_mysore', name: 'MYSORE', code: 'MYS', city: 'Mysore', is_active: true, order: 1, created_at: new Date().toISOString() },
    { id: 'cntr_bangalore', name: 'BANGALORE', code: 'BTC', city: 'Bangalore', is_active: true, order: 2, created_at: new Date().toISOString() },
    { id: 'cntr_ooty', name: 'OOTY', code: 'OOT', city: 'Ooty', is_active: true, order: 3, created_at: new Date().toISOString() },
    { id: 'cntr_madras', name: 'MADRAS', code: 'MRC', city: 'Chennai', is_active: true, order: 4, created_at: new Date().toISOString() },
    { id: 'cntr_kolkata', name: 'KOLKATA', code: 'CAL', city: 'Kolkata', is_active: true, order: 5, created_at: new Date().toISOString() },
    { id: 'cntr_delhi', name: 'DELHI', code: 'DEL', city: 'Delhi', is_active: true, order: 6, created_at: new Date().toISOString() },
    { id: 'cntr_hyderabad', name: 'HYDERABAD', code: 'HYD', city: 'Hyderabad', is_active: true, order: 7, created_at: new Date().toISOString() },
    { id: 'cntr_pune', name: 'PUNE', code: 'PUN', city: 'Pune', is_active: true, order: 8, created_at: new Date().toISOString() },
    { id: 'cntr_mumbai', name: 'MUMBAI', code: 'MUM', city: 'Mumbai', is_active: true, order: 9, created_at: new Date().toISOString() },
  ],
  race_days: [
    {
      id: 'day_mys_today',
      center_id: 'cntr_mysore',
      center_name: 'MYSORE',
      race_date: '2026-09-17',
      title: 'Mysore - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 6,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_btc_today',
      center_id: 'cntr_bangalore',
      center_name: 'BANGALORE',
      race_date: '2026-09-17',
      title: 'Bangalore - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 6,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_oot_today',
      center_id: 'cntr_ooty',
      center_name: 'OOTY',
      race_date: '2026-09-17',
      title: 'Ooty - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_mrc_today',
      center_id: 'cntr_madras',
      center_name: 'MADRAS',
      race_date: '2026-09-17',
      title: 'Madras - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_hyd_today',
      center_id: 'cntr_hyderabad',
      center_name: 'HYDERABAD',
      race_date: '2026-09-17',
      title: 'Hyderabad - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_cal_today',
      center_id: 'cntr_kolkata',
      center_name: 'KOLKATA',
      race_date: '2026-09-17',
      title: 'Kolkata - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_del_today',
      center_id: 'cntr_delhi',
      center_name: 'DELHI',
      race_date: '2026-09-17',
      title: 'Delhi - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_pun_today',
      center_id: 'cntr_pune',
      center_name: 'PUNE',
      race_date: '2026-09-17',
      title: 'Pune - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: 'day_mum_today',
      center_id: 'cntr_mumbai',
      center_name: 'MUMBAI',
      race_date: '2026-09-17',
      title: 'Mumbai - 17th Sep 2026',
      status: 'PUBLISHED',
      races_count: 4,
      created_at: new Date().toISOString(),
    },
  ],
  races: [
    {
      id: 'race_sfc_07',
      center_id: 'cntr_bangalore',
      race_day_id: 'day_btc_today',
      name: 'The Star Future Cup',
      race_no: 2,
      race_number: 2,
      venue: 'Bangalore Turf Club',
      race_time: '1:45 PM',
      date_str: 'Today, 17th Sep',
      distance: '1600m',
      going: 'Good',
      class_grade: 'Grade 2 • 3yo Terms',
      status: 'OPEN_FOR_BETTING',
      winner_horse_id: null,
      place_horses_ids: [],
      settled_at: null,
      horses: [
        {
          id: 'hrs_sfc_01',
          race_id: 'race_sfc_07',
          horse_no: 1,
          serial_no: 1,
          gate_no: 5,
          name: 'Speed Princess',
          jockey: 'Kumar',
          trainer: 'Srikant',
          win_odds: 2.5,
          place_odds: 1.4,
          silk_color: '#dc2626',
          form: '1-1-2-1',
          weight: '55.5 kg',
        },
        {
          id: 'hrs_sfc_02',
          race_id: 'race_sfc_07',
          horse_no: 2,
          serial_no: 2,
          gate_no: 2,
          name: 'Royal Commander',
          jockey: 'Suraj Narredu',
          trainer: 'S. Padmanabhan',
          win_odds: 3.75,
          place_odds: 1.9,
          silk_color: '#2563eb',
          form: '2-1-3-1',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_sfc_03',
          race_id: 'race_sfc_07',
          horse_no: 3,
          serial_no: 3,
          gate_no: 4,
          name: 'Golden Arrow',
          jockey: 'A. Sandesh',
          trainer: 'Prasanna Kumar',
          win_odds: 10.0,
          place_odds: 2.5,
          silk_color: '#16a34a',
          form: '3-4-2-1',
          weight: '56.0 kg',
        },
        {
          id: 'hrs_sfc_04',
          race_id: 'race_sfc_07',
          horse_no: 4,
          serial_no: 4,
          gate_no: 1,
          name: 'Thunder Bolt',
          jockey: 'P. Trevor',
          trainer: 'P. Shroff',
          win_odds: 8.0,
          place_odds: 1.75,
          silk_color: '#d97706',
          form: '4-2-1-3',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_sfc_05',
          race_id: 'race_sfc_07',
          horse_no: 5,
          serial_no: 5,
          gate_no: 3,
          name: 'Mystic Star',
          jockey: 'C. S. Jodha',
          trainer: 'Dallas Todywalla',
          win_odds: 6.0,
          place_odds: 1.25,
          silk_color: '#7c3aed',
          form: '1-3-2-2',
          weight: '55.0 kg',
        },
        {
          id: 'hrs_sfc_06',
          race_id: 'race_sfc_07',
          horse_no: 6,
          serial_no: 6,
          gate_no: 6,
          name: 'Silver Lining',
          jockey: 'Neeraj Rawal',
          trainer: 'Imtiaz Sait',
          win_odds: 25.0,
          place_odds: 4.0,
          silk_color: '#0891b2',
          form: '5-6-3-4',
          weight: '54.0 kg',
        },
        {
          id: 'hrs_sfc_07',
          race_id: 'race_sfc_07',
          horse_no: 7,
          serial_no: 7,
          gate_no: 7,
          name: 'Fire Blade',
          jockey: 'Imran Chisty',
          trainer: 'Narendra Lagad',
          win_odds: 5.0,
          place_odds: 2.0,
          silk_color: '#e11d48',
          form: '2-1-2-1',
          weight: '56.5 kg',
        },
      ],
    },
    {
      id: 'race_blr_01',
      name: 'The Bangalore Derby (Grade 1)',
      race_no: 1,
      venue: 'Bangalore Turf Club',
      race_time: '3:30 PM',
      date_str: 'Today, 5th Sep',
      distance: '2400m',
      going: 'Good to Firm',
      class_grade: 'Grade 1 • 3yo Colts & Fillies',
      status: 'OPEN',
      winner_horse_id: null,
      place_horses_ids: [],
      settled_at: null,
      horses: [
        {
          id: 'hrs_101',
          race_id: 'race_blr_01',
          horse_no: 1,
          serial_no: 1,
          gate_no: 3,
          name: 'War Hammer',
          jockey: 'Suraj Narredu',
          trainer: 'Prasanna Kumar',
          win_odds: 2.8,
          place_odds: 1.45,
          silk_color: '#dc2626',
          form: '1-1-2-1',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_102',
          race_id: 'race_blr_01',
          horse_no: 2,
          serial_no: 2,
          gate_no: 1,
          name: 'Desert God',
          jockey: 'A. Sandesh',
          trainer: 'S. Padmanabhan',
          win_odds: 4.5,
          place_odds: 1.85,
          silk_color: '#2563eb',
          form: '3-1-1-4',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_103',
          race_id: 'race_blr_01',
          horse_no: 3,
          serial_no: 3,
          gate_no: 4,
          name: 'Miracle',
          jockey: 'P. Trevor',
          trainer: 'P. Shroff',
          win_odds: 6.2,
          place_odds: 2.2,
          silk_color: '#16a34a',
          form: '1-2-1-3',
          weight: '55.5 kg',
        },
        {
          id: 'hrs_104',
          race_id: 'race_blr_01',
          horse_no: 4,
          serial_no: 4,
          gate_no: 2,
          name: 'Northern Lights',
          jockey: 'C. S. Jodha',
          trainer: 'Dallas Todywalla',
          win_odds: 8.5,
          place_odds: 2.9,
          silk_color: '#d97706',
          form: '4-3-2-2',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_105',
          race_id: 'race_blr_01',
          horse_no: 5,
          serial_no: 5,
          gate_no: 6,
          name: 'Star Superior',
          jockey: 'Akshay Kumar',
          trainer: 'Rajesh Narredu',
          win_odds: 12.0,
          place_odds: 3.8,
          silk_color: '#7c3aed',
          form: '2-4-3-5',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_106',
          race_id: 'race_blr_01',
          horse_no: 6,
          serial_no: 6,
          gate_no: 5,
          name: 'Imperial Power',
          jockey: 'Yash Narredu',
          trainer: 'Deepesh Narredu',
          win_odds: 16.5,
          place_odds: 4.6,
          silk_color: '#0891b2',
          form: '5-1-4-2',
          weight: '57.0 kg',
        },
      ],
    },
    {
      id: 'race_pune_02',
      name: 'The Pune Monsoon Cup',
      venue: 'Pune Race Course',
      race_time: '4:15 PM',
      date_str: 'Today, 5th Sep',
      distance: '2000m',
      going: 'Soft',
      class_grade: 'Grade 2 • Handicap 40-65',
      status: 'OPEN',
      winner_horse_id: null,
      place_horses_ids: [],
      settled_at: null,
      horses: [
        {
          id: 'hrs_201',
          race_id: 'race_pune_02',
          horse_no: 1,
          name: 'Enigma',
          jockey: 'P. Trevor',
          trainer: 'P. Shroff',
          win_odds: 3.2,
          place_odds: 1.5,
          silk_color: '#9333ea',
          form: '1-1-3-1',
          weight: '59.0 kg',
        },
        {
          id: 'hrs_202',
          race_id: 'race_pune_02',
          horse_no: 2,
          name: 'Juliette',
          jockey: 'C. S. Jodha',
          trainer: 'K. S. Narredu',
          win_odds: 3.8,
          place_odds: 1.65,
          silk_color: '#e11d48',
          form: '2-1-1-2',
          weight: '57.5 kg',
        },
        {
          id: 'hrs_203',
          race_id: 'race_pune_02',
          horse_no: 3,
          name: 'Forest Flame',
          jockey: 'Suraj Narredu',
          trainer: 'S. K. Sunderji',
          win_odds: 5.5,
          place_odds: 2.1,
          silk_color: '#059669',
          form: '3-2-2-4',
          weight: '56.0 kg',
        },
        {
          id: 'hrs_204',
          race_id: 'race_pune_02',
          horse_no: 4,
          name: 'Golden Oaks',
          jockey: 'Neeraj Rawal',
          trainer: 'Imtiaz Sait',
          win_odds: 9.5,
          place_odds: 3.1,
          silk_color: '#eab308',
          form: '4-3-5-2',
          weight: '54.5 kg',
        },
        {
          id: 'hrs_205',
          race_id: 'race_pune_02',
          horse_no: 5,
          name: 'Successor',
          jockey: 'Imran Chisty',
          trainer: 'Narendra Lagad',
          win_odds: 14.0,
          place_odds: 4.2,
          silk_color: '#3b82f6',
          form: '5-5-1-6',
          weight: '53.0 kg',
        },
      ],
    },
    {
      id: 'race_mum_03',
      name: 'The Indian 1000 Guineas',
      venue: 'Mahalaxmi, Mumbai',
      race_time: '5:00 PM',
      date_str: 'Today, 5th Sep',
      distance: '1600m',
      going: 'Good',
      class_grade: 'Grade 1 • 3yo Indian Fillies',
      status: 'OPEN',
      winner_horse_id: null,
      place_horses_ids: [],
      settled_at: null,
      horses: [
        {
          id: 'hrs_301',
          race_id: 'race_mum_03',
          horse_no: 1,
          name: "King's Ransom",
          jockey: 'P. S. Chouhan',
          trainer: 'P. Shroff',
          win_odds: 2.1,
          place_odds: 1.3,
          silk_color: '#2563eb',
          form: '1-1-1-1',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_302',
          race_id: 'race_mum_03',
          horse_no: 2,
          name: 'Dangerous',
          jockey: 'S. Zervan',
          trainer: 'Adhirajsingh Jodha',
          win_odds: 4.2,
          place_odds: 1.75,
          silk_color: '#ea580c',
          form: '2-1-2-3',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_303',
          race_id: 'race_mum_03',
          horse_no: 3,
          name: 'Supernatural',
          jockey: 'Trevor Patel',
          trainer: 'Dallas Todywalla',
          win_odds: 6.8,
          place_odds: 2.3,
          silk_color: '#10b981',
          form: '3-3-1-2',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_304',
          race_id: 'race_mum_03',
          horse_no: 4,
          name: 'Wall Street',
          jockey: 'A. Sandesh',
          trainer: 'P. Shroff',
          win_odds: 11.5,
          place_odds: 3.6,
          silk_color: '#6366f1',
          form: '4-2-4-5',
          weight: '57.0 kg',
        },
      ],
    },
    {
      id: 'race_mys_04',
      name: 'The Mysore 1000 Guineas',
      venue: 'Mysore Race Club',
      race_time: '2:15 PM',
      date_str: 'Earlier Today',
      distance: '1600m',
      going: 'Firm',
      class_grade: 'Grade 3 • Terms',
      status: 'RESULTED',
      winner_horse_id: 'hrs_401',
      place_horses_ids: ['hrs_401', 'hrs_402', 'hrs_403'],
      settled_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      horses: [
        {
          id: 'hrs_401',
          race_id: 'race_mys_04',
          horse_no: 1,
          name: 'Mystic Bay',
          jockey: 'Suraj Narredu',
          trainer: 'M. Eshwer',
          win_odds: 2.6,
          place_odds: 1.4,
          silk_color: '#e11d48',
          form: '1-1-2-1',
          weight: '57.0 kg',
        },
        {
          id: 'hrs_402',
          race_id: 'race_mys_04',
          horse_no: 2,
          name: 'Flying Scotsman',
          jockey: 'Arshad Alam',
          trainer: 'Bobby',
          win_odds: 4.8,
          place_odds: 1.9,
          silk_color: '#3b82f6',
          form: '2-3-1-2',
          weight: '56.0 kg',
        },
        {
          id: 'hrs_403',
          race_id: 'race_mys_04',
          horse_no: 3,
          name: 'Crown Witness',
          jockey: 'Darshan R. N.',
          trainer: 'Rakesh',
          win_odds: 7.2,
          place_odds: 2.4,
          silk_color: '#10b981',
          form: '3-2-4-3',
          weight: '54.5 kg',
        },
        {
          id: 'hrs_404',
          race_id: 'race_mys_04',
          horse_no: 4,
          name: 'Tia Maria',
          jockey: 'B. Paswan',
          trainer: 'Santosh Rao',
          win_odds: 13.0,
          place_odds: 3.9,
          silk_color: '#eab308',
          form: '5-4-5-4',
          weight: '53.0 kg',
        },
      ],
    },
  ],
  bets: [
    {
      id: 'bet_seed_01',
      user_id: 'usr_arjun',
      username: 'arjun_punters',
      race_id: 'race_mys_04',
      race_name: 'The Mysore 1000 Guineas',
      venue: 'Mysore Race Club',
      horse_id: 'hrs_401',
      horse_name: 'Mystic Bay',
      horse_no: 1,
      bet_type: 'WIN',
      odds: 2.6,
      stake: 500,
      potential_win: 1300,
      payout: 1300,
      status: 'WON',
      placed_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      settled_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  transactions: [
    {
      id: 'tx_seed_01',
      user_id: 'usr_arjun',
      username: 'arjun_punters',
      type: 'DEPOSIT',
      amount: 4200,
      balance_after: 4200,
      description: 'Initial Wallet Deposit via UPI',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'tx_seed_02',
      user_id: 'usr_arjun',
      username: 'arjun_punters',
      type: 'BET',
      amount: -500,
      balance_after: 3700,
      description: 'WIN bet on Mystic Bay (Mysore 1000 Guineas)',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'tx_seed_03',
      user_id: 'usr_arjun',
      username: 'arjun_punters',
      type: 'WIN',
      amount: 1300,
      balance_after: 5000,
      description: 'Payout: Mystic Bay won Mysore 1000 Guineas (Odds 2.60)',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  banners: [
    {
      id: 'bnr_01',
      title: 'Bangalore Derby 2026',
      subtitle: 'India’s Richest Classic • Place Win & Place Bets with Top Odds',
      image_url: '/images/race_action.jpg',
      link: '/race/race_sfc_07',
      tag: 'GRADE 1 FEATURE',
      is_active: true,
    },
    {
      id: 'bnr_02',
      title: 'Monsoon Racing Season',
      subtitle: 'Pune Race Course Live Now • Fast UPI Deposits & Instant Payouts',
      image_url: '/images/jockey_hero.jpg',
      link: '/race/race_pune_02',
      tag: 'LIVE ACTION',
      is_active: true,
    },
    {
      id: 'bnr_03',
      title: 'Champion Thoroughbreds & Live Odds',
      subtitle: 'Exclusive runners with real-time exposure tracking and instant returns',
      image_url: '/images/horse_runner.jpg',
      link: '/race/race_sfc_07',
      tag: 'PROMO SPECIAL',
      is_active: true,
    },
  ],
  otps: {},
};

let db: DBData = defaultData;

// Initialize DB file
function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      
      // Ensure race_centers and race_days exist
      if (!db.race_centers || db.race_centers.length === 0) {
        db.race_centers = defaultData.race_centers;
      }
      if (!db.race_days || db.race_days.length === 0) {
        db.race_days = defaultData.race_days;
      }

      // Ensure Star Future Cup race exists
      if (!db.races.some((r) => r.id === 'race_sfc_07')) {
        const sfcRace = defaultData.races.find((r) => r.id === 'race_sfc_07');
        if (sfcRace) db.races.unshift(sfcRace);
      }

      // Ensure every horse has serial_no, gate_no and every race has image_url, center_id, race_day_id
      const sampleImages = ['/images/race_action.jpg', '/images/jockey_hero.jpg', '/images/horse_runner.jpg'];
      db.races.forEach((r, rIdx) => {
        if (!r.image_url) {
          r.image_url = sampleImages[rIdx % sampleImages.length];
        }
        if (!r.center_id) {
          const v = (r.venue || r.name || '').toLowerCase();
          if (v.includes('mysore')) r.center_id = 'cntr_mysore';
          else if (v.includes('bangalore') || v.includes('btc')) r.center_id = 'cntr_bangalore';
          else if (v.includes('ooty')) r.center_id = 'cntr_ooty';
          else if (v.includes('madras') || v.includes('chennai') || v.includes('guindy')) r.center_id = 'cntr_madras';
          else if (v.includes('kolkata') || v.includes('calcutta')) r.center_id = 'cntr_kolkata';
          else if (v.includes('delhi')) r.center_id = 'cntr_delhi';
          else if (v.includes('hyderabad')) r.center_id = 'cntr_hyderabad';
          else if (v.includes('pune')) r.center_id = 'cntr_pune';
          else if (v.includes('mumbai') || v.includes('mahalaxmi')) r.center_id = 'cntr_mumbai';
          else r.center_id = 'cntr_bangalore';
        }
        if (!r.race_day_id) {
          const centerDay = db.race_days.find((d) => d.center_id === r.center_id);
          r.race_day_id = centerDay ? centerDay.id : 'day_btc_today';
        }
        r.horses.forEach((h, idx) => {
          if (h.serial_no === undefined) h.serial_no = h.horse_no || (idx + 1);
          if (h.horse_no === undefined) h.horse_no = h.serial_no;
          if (h.gate_no === undefined) h.gate_no = idx + 1;
        });
      });

      // Ensure users have ref_id, full_name, email
      db.users.forEach((u) => {
        if (!u.ref_id) u.ref_id = u.id === 'usr_arjun' ? 'usr_arjun' : '100001';
        if (!u.full_name) u.full_name = u.id === 'usr_arjun' ? 'Arjun Kumar' : 'Turf Derby Master';
        if (!u.email) u.email = u.id === 'usr_arjun' ? 'arjun.punters@gmail.com' : 'admin@derbybet.turf';
        if (u.id === 'usr_arjun') {
          u.full_name = 'Arjun Kumar';
          u.phone = '9876543210';
          u.email = 'arjun.punters@gmail.com';
          u.ref_id = 'usr_arjun';
        }
      });

      saveDatabase();
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database:', err);
    db = defaultData;
  }
}

function saveDatabase() {
  try {
    if (process.env.VERCEL === '1' || process.env.NOW_REGION) {
      return;
    }
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

loadDatabase();

// Helpers
function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ----------------------------------------------------
// HEALTH CHECK
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', time: new Date().toISOString() });
});

// ----------------------------------------------------
// AUTH APIS
// ----------------------------------------------------

// 1. Send OTP for Phone Signup
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || String(phone).trim().length < 8) {
    return res.status(400).json({ error: 'Valid phone number is required (min 8 digits)' });
  }
  const cleanPhone = String(phone).trim();
  // Generate 6 digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.otps[cleanPhone] = {
    code,
    expires_at: Date.now() + 10 * 60 * 1000, // 10 mins
  };
  saveDatabase();

  console.log(`[SMS Gateway Mock] OTP for ${cleanPhone} is ${code}`);
  return res.json({
    success: true,
    message: `OTP sent to ${cleanPhone}`,
    simulated_otp: code, // Returned for effortless demo testing in preview
  });
});

// 2. Sign Up: Phone + OTP + unique Username + Password
app.post('/api/auth/signup', (req, res) => {
  const { phone, otp, username, password } = req.body;

  if (!phone || !username || !password) {
    return res.status(400).json({ error: 'Phone, username, and password are required' });
  }

  const cleanPhone = String(phone).trim();
  const cleanUsername = String(username).trim().toLowerCase();

  // Check username unique
  const existingUser = db.users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already taken. Please choose another.' });
  }

  // Check OTP
  const storedOtp = db.otps[cleanPhone];
  if (!storedOtp || storedOtp.code !== String(otp).trim() || storedOtp.expires_at < Date.now()) {
    // If testing without OTP call, allow fallback OTP 123456
    if (String(otp).trim() !== '123456' && (!storedOtp || storedOtp.code !== String(otp).trim())) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. (Try 123456 for testing)' });
    }
  }

  // Create user with starting balance of ₹5000 as welcome credit!
  const newUser: User = {
    id: generateId('usr'),
    phone: cleanPhone,
    username: cleanUsername,
    password_hash: String(password).trim(),
    balance: 5000,
    exposure: 0,
    role: 'user',
    profile_photo: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Record initial welcome bonus transaction
  const welcomeTx: Transaction = {
    id: generateId('tx'),
    user_id: newUser.id,
    username: newUser.username,
    type: 'DEPOSIT',
    amount: 5000,
    balance_after: 5000,
    description: 'Welcome Sign-up Bonus',
    created_at: new Date().toISOString(),
  };
  db.transactions.unshift(welcomeTx);

  saveDatabase();

  const { password_hash, ...userProfile } = newUser;
  return res.json({
    success: true,
    user: userProfile,
    token: `token_${newUser.id}`,
  });
});

// 3. Login: Username + Password (NOT OTP every time)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const user = db.users.find(
    (u) => (u.username.toLowerCase() === cleanUsername || u.phone === cleanUsername) && u.password_hash === String(password).trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const { password_hash, ...userProfile } = user;
  return res.json({
    success: true,
    user: userProfile,
    token: `token_${user.id}`,
  });
});

// 4. Current user profile
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const userId = req.query.user_id as string || authHeader.replace('Bearer token_', '');

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found or unauthenticated' });
  }

  const { password_hash, ...userProfile } = user;
  return res.json({ success: true, user: userProfile });
});

// 5. Change Password
app.post('/api/auth/change-password', (req, res) => {
  const { user_id, current_password, new_password } = req.body;
  const user = db.users.find((u) => u.id === user_id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.password_hash !== current_password) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  if (!new_password || new_password.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  user.password_hash = new_password;
  saveDatabase();
  return res.json({ success: true, message: 'Password updated successfully' });
});

// ----------------------------------------------------
// RACE CENTERS APIS (Level 1 Master Setup)
// ----------------------------------------------------

// GET /api/race-centers
app.get('/api/race-centers', (req, res) => {
  const showAll = req.query.all === 'true';
  const centers = showAll ? db.race_centers : db.race_centers.filter((c) => c.is_active);
  return res.json({ success: true, centers });
});

// POST /api/admin/race-centers (Add new race center)
app.post('/api/admin/race-centers', (req, res) => {
  const { name, code, city, is_active } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Center Name and Code are required' });
  }

  const existing = db.race_centers.find(
    (c) => c.name.toLowerCase() === String(name).trim().toLowerCase() || c.code.toLowerCase() === String(code).trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: `Race Center "${name}" or code "${code}" already exists` });
  }

  const newCenter: RaceCenter = {
    id: generateId('cntr'),
    name: String(name).trim().toUpperCase(),
    code: String(code).trim().toUpperCase(),
    city: city ? String(city).trim() : String(name).trim(),
    is_active: is_active !== undefined ? Boolean(is_active) : true,
    order: db.race_centers.length + 1,
    created_at: new Date().toISOString(),
  };

  db.race_centers.push(newCenter);
  saveDatabase();
  return res.json({ success: true, message: `Race Center "${newCenter.name}" added successfully!`, center: newCenter });
});

// PUT /api/admin/race-centers/:id
app.put('/api/admin/race-centers/:id', (req, res) => {
  const center = db.race_centers.find((c) => c.id === req.params.id);
  if (!center) return res.status(404).json({ error: 'Race Center not found' });

  if (req.body.name) center.name = String(req.body.name).trim().toUpperCase();
  if (req.body.code) center.code = String(req.body.code).trim().toUpperCase();
  if (req.body.city !== undefined) center.city = String(req.body.city).trim();
  if (req.body.is_active !== undefined) center.is_active = Boolean(req.body.is_active);
  if (req.body.order !== undefined) center.order = Number(req.body.order);

  saveDatabase();
  return res.json({ success: true, message: `Race Center "${center.name}" updated!`, center });
});

// ----------------------------------------------------
// RACE DAYS / RACE CARDS APIS (Level 2 Master Setup)
// ----------------------------------------------------

// GET /api/race-days (Supports ?center=mysore&date=today or ?center_id=...&date=...)
app.get('/api/race-days', (req, res) => {
  const centerQuery = (req.query.center as string || '').toLowerCase().trim();
  const centerIdQuery = req.query.center_id as string;
  const dateQuery = (req.query.date as string || '').toLowerCase().trim();

  let days = [...db.race_days];

  if (centerIdQuery) {
    days = days.filter((d) => d.center_id === centerIdQuery);
  } else if (centerQuery && centerQuery !== 'all') {
    const center = db.race_centers.find((c) => 
      c.name.toLowerCase() === centerQuery || 
      c.code.toLowerCase() === centerQuery || 
      c.id.toLowerCase() === centerQuery
    );
    if (center) {
      days = days.filter((d) => d.center_id === center.id);
    } else {
      days = days.filter((d) => d.center_name.toLowerCase().includes(centerQuery));
    }
  }

  // Count active races for each race day
  days = days.map((d) => ({
    ...d,
    races_count: db.races.filter((r) => r.race_day_id === d.id || r.center_id === d.center_id).length,
  }));

  return res.json({ success: true, race_days: days });
});

// GET /api/race-day (Alias for GET /api/race-days?center=...&date=...)
app.get('/api/race-day', (req, res) => {
  const centerQuery = (req.query.center as string || '').toLowerCase().trim();
  const centerIdQuery = req.query.center_id as string;

  let center = centerIdQuery ? db.race_centers.find((c) => c.id === centerIdQuery) : null;
  if (!center && centerQuery) {
    center = db.race_centers.find((c) => 
      c.name.toLowerCase() === centerQuery || 
      c.code.toLowerCase() === centerQuery ||
      c.id.toLowerCase() === centerQuery
    );
  }

  const raceDay = db.race_days.find((d) => 
    (center && d.center_id === center.id) ||
    (centerQuery && d.center_name.toLowerCase().includes(centerQuery))
  ) || db.race_days[0];

  const targetCenter = center || db.race_centers.find((c) => c.id === raceDay?.center_id) || db.race_centers[0];

  const races = db.races.filter((r) => 
    (raceDay && r.race_day_id === raceDay.id) || 
    (targetCenter && r.center_id === targetCenter.id) ||
    (targetCenter && r.venue.toLowerCase().includes(targetCenter.name.toLowerCase()))
  );

  return res.json({ 
    success: true, 
    center: targetCenter, 
    race_day: raceDay, 
    races 
  });
});

// POST /api/admin/race-days
app.post('/api/admin/race-days', (req, res) => {
  const { center_id, race_date, title, status } = req.body;
  const center = db.race_centers.find((c) => c.id === center_id);
  if (!center) return res.status(404).json({ error: 'Selected Race Center not found' });

  const newRaceDay: RaceDay = {
    id: generateId('day'),
    center_id: center.id,
    center_name: center.name,
    race_date: race_date || new Date().toISOString().split('T')[0],
    title: title || `${center.name} - ${race_date || 'Today'}`,
    status: status || 'PUBLISHED',
    races_count: 0,
    created_at: new Date().toISOString(),
  };

  db.race_days.unshift(newRaceDay);
  saveDatabase();
  return res.json({ success: true, message: `Race Card "${newRaceDay.title}" created successfully!`, race_day: newRaceDay });
});

// POST /api/admin/race-days/:id/publish
app.post('/api/admin/race-days/:id/publish', (req, res) => {
  const raceDay = db.race_days.find((d) => d.id === req.params.id);
  if (!raceDay) return res.status(404).json({ error: 'Race Day not found' });
  raceDay.status = 'PUBLISHED';
  saveDatabase();
  return res.json({ success: true, message: `Race Day "${raceDay.title}" is now PUBLISHED!`, race_day: raceDay });
});

// ----------------------------------------------------
// RACES APIS (Level 3 Master Setup & Betting Activation)
// ----------------------------------------------------

// GET /api/races?status=open (or upcoming, resulted, draft, all, center_id=..., race_day_id=...)
app.get('/api/races', (req, res) => {
  const statusFilter = (req.query.status as string || '').toLowerCase();
  const centerId = req.query.center_id as string;
  const raceDayId = req.query.race_day_id as string;
  const centerQuery = (req.query.center as string || '').toLowerCase().trim();

  let races = [...db.races];

  if (centerId) {
    races = races.filter((r) => r.center_id === centerId);
  } else if (centerQuery && centerQuery !== 'all') {
    const center = db.race_centers.find((c) => 
      c.name.toLowerCase() === centerQuery || 
      c.code.toLowerCase() === centerQuery || 
      c.id.toLowerCase() === centerQuery
    );
    if (center) {
      races = races.filter((r) => r.center_id === center.id || r.venue.toLowerCase().includes(center.name.toLowerCase()));
    }
  }

  if (raceDayId) {
    races = races.filter((r) => r.race_day_id === raceDayId);
  }

  if (statusFilter === 'open' || statusFilter === 'open_for_betting') {
    races = races.filter((r) => r.status === 'OPEN' || r.status === 'OPEN_FOR_BETTING' || r.status === 'LIVE');
  } else if (statusFilter === 'upcoming') {
    races = races.filter((r) => r.status === 'OPEN' || r.status === 'OPEN_FOR_BETTING' || r.status === 'LIVE' || r.status === 'UPCOMING' || r.status === 'CLOSED');
  } else if (statusFilter === 'live') {
    races = races.filter((r) => r.status === 'LIVE' || r.status === 'OPEN_FOR_BETTING');
  } else if (statusFilter === 'resulted') {
    races = races.filter((r) => r.status === 'RESULTED');
  } else if (statusFilter === 'draft') {
    races = races.filter((r) => r.status === 'DRAFT');
  } else if (statusFilter !== 'admin_all') {
    races = races.filter((r) => r.status !== 'DRAFT');
  }

  return res.json({ success: true, races });
});

// GET /api/races/:id
app.get('/api/races/:id', (req, res) => {
  const race = db.races.find((r) => r.id === req.params.id);
  if (!race) {
    return res.status(404).json({ error: 'Race not found' });
  }
  return res.json({ success: true, race });
});

// POST /api/admin/races/:id/open-betting
// Activates target race as OPEN_FOR_BETTING, keeping other upcoming races active with odds
app.post('/api/admin/races/:id/open-betting', (req, res) => {
  const targetRace = db.races.find((r) => r.id === req.params.id);
  if (!targetRace) return res.status(404).json({ error: 'Race not found' });

  // 1. Keep other races as UPCOMING (unless already resulted) and ensure odds are not suspended
  const centerId = targetRace.center_id;
  const raceDayId = targetRace.race_day_id;

  db.races.forEach((r) => {
    const isSameDayOrCenter = (raceDayId && r.race_day_id === raceDayId) || 
                              (centerId && r.center_id === centerId) || 
                              (r.venue && targetRace.venue && r.venue.toLowerCase() === targetRace.venue.toLowerCase());
    if (r.id !== targetRace.id && isSameDayOrCenter) {
      if (r.status !== 'RESULTED') {
        r.status = 'UPCOMING';
        r.is_suspended = false;
        r.horses.forEach((h) => {
          h.is_suspended = false;
        });
      }
    }
  });

  // 2. Open target race
  targetRace.status = 'OPEN_FOR_BETTING';
  targetRace.is_suspended = false;
  targetRace.horses.forEach((h) => {
    h.is_suspended = false;
  });

  saveDatabase();

  return res.json({
    success: true,
    message: `Race #${targetRace.race_no || ''} "${targetRace.name}" is now OPEN FOR BETTING!`,
    race: targetRace,
    races: db.races,
  });
});

// POST /api/admin/races/:id/publish (1-Click Publish to Live Betting)
app.post('/api/admin/races/:id/publish', (req, res) => {
  const race = db.races.find((r) => r.id === req.params.id);
  if (!race) {
    return res.status(404).json({ error: 'Race not found' });
  }
  race.status = 'OPEN_FOR_BETTING';
  race.is_suspended = false;
  saveDatabase();
  return res.json({ success: true, message: `Race "${race.name}" published live for user betting!`, race });
});

// ----------------------------------------------------
// BETS APIS (With Strict Server-Side Security Validation)
// ----------------------------------------------------

// POST /api/bets/place
// Body: race_id, horse_id, bet_type (WIN/PLACE), odds, stake
app.post('/api/bets/place', (req, res) => {
  const { race_id, horse_id, bet_type, odds, stake, user_id } = req.body;

  if (!race_id || !horse_id || !bet_type || !odds || !stake) {
    return res.status(400).json({ error: 'Missing required bet parameters' });
  }

  const numStake = Number(stake);
  const numOdds = Number(odds);

  if (isNaN(numStake) || numStake <= 0) {
    return res.status(400).json({ error: 'Stake must be a positive number' });
  }

  const user = db.users.find((u) => u.id === user_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found. Please log in.' });
  }

  const race = db.races.find((r) => r.id === race_id);
  if (!race) {
    return res.status(404).json({ error: 'Race not found' });
  }

  // 🔒 CRITICAL SECURITY CHECK: Only allow bet if race status is OPEN_FOR_BETTING, LIVE, or OPEN
  const isBettingOpen = race.status === 'OPEN_FOR_BETTING' || race.status === 'LIVE' || race.status === 'OPEN';
  if (!isBettingOpen) {
    return res.status(400).json({
      error: `Betting is not open for this race (${race.name} is ${race.status}). Only the currently active race allows betting.`
    });
  }

  // Check if race betting is suspended
  if (race.is_suspended) {
    return res.status(400).json({
      error: 'Betting is currently suspended for this race. Please wait for odds to resume.'
    });
  }

  const horse = race.horses.find((h) => h.id === horse_id);
  if (!horse) {
    return res.status(404).json({ error: 'Selected horse not found in this race' });
  }

  // Check if individual runner betting is suspended
  if (horse.is_suspended) {
    return res.status(400).json({
      error: `Betting is suspended for #${horse.horse_no} ${horse.name}. Odds are currently locked.`
    });
  }

  // Check balance >= stake
  if (user.balance < numStake) {
    return res.status(400).json({
      error: `Insufficient balance! Your current balance is ₹${user.balance.toLocaleString()}, but stake is ₹${numStake.toLocaleString()}.`,
    });
  }

  // Calculate potential win
  const potentialWin = Math.round(numStake * numOdds);

  // Deduct from balance, Add to exposure
  user.balance -= numStake;
  user.exposure += numStake;

  const newBet: Bet = {
    id: generateId('bet'),
    user_id: user.id,
    username: user.username,
    race_id: race.id,
    race_name: race.name,
    venue: race.venue,
    horse_id: horse.id,
    horse_name: horse.name,
    horse_no: horse.horse_no,
    serial_no: horse.serial_no || horse.horse_no,
    gate_no: horse.gate_no,
    jockey: horse.jockey,
    trainer: horse.trainer,
    bet_type: bet_type.toUpperCase() as 'WIN' | 'PLACE',
    odds: numOdds,
    stake: numStake,
    potential_win: potentialWin,
    payout: 0,
    status: 'PENDING',
    placed_at: new Date().toISOString(),
    settled_at: null,
  };

  db.bets.unshift(newBet);

  // Add transaction
  const tx: Transaction = {
    id: generateId('tx'),
    user_id: user.id,
    username: user.username,
    type: 'BET',
    amount: -numStake,
    balance_after: user.balance,
    description: `${bet_type} bet on #${horse.horse_no} (Gate ${horse.gate_no}) ${horse.name} (${race.name}) @ ${numOdds}`,
    created_at: new Date().toISOString(),
    reference_id: newBet.id,
  };
  db.transactions.unshift(tx);

  saveDatabase();

  const { password_hash, ...userProfile } = user;
  return res.json({
    success: true,
    message: 'Bet placed successfully!',
    bet: newBet,
    user: userProfile,
  });
});

// GET /api/bets/my?user_id=...
app.get('/api/bets/my', (req, res) => {
  const userId = req.query.user_id as string;
  if (!userId) {
    return res.status(400).json({ error: 'user_id query param is required' });
  }

  const userBets = db.bets.filter((b) => b.user_id === userId);
  return res.json({ success: true, bets: userBets });
});

// ----------------------------------------------------
// WALLET / TRANSACTIONS APIS
// ----------------------------------------------------

// POST /api/wallet/deposit
app.post('/api/wallet/deposit', (req, res) => {
  const { user_id, amount, payment_method } = req.body;
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ error: 'Minimum deposit amount is ₹100' });
  }

  const user = db.users.find((u) => u.id === user_id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.balance += numAmount;

  const tx: Transaction = {
    id: generateId('tx'),
    user_id: user.id,
    username: user.username,
    type: 'DEPOSIT',
    amount: numAmount,
    balance_after: user.balance,
    description: `Deposit via ${payment_method || 'UPI / NetBanking'}`,
    created_at: new Date().toISOString(),
  };
  db.transactions.unshift(tx);
  saveDatabase();

  const { password_hash, ...userProfile } = user;
  return res.json({
    success: true,
    message: `Successfully deposited ₹${numAmount.toLocaleString()}!`,
    user: userProfile,
    transaction: tx,
  });
});

// POST /api/wallet/withdraw
app.post('/api/wallet/withdraw', (req, res) => {
  const { user_id, amount, upi_id, bank_account } = req.body;
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount < 500) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is ₹500' });
  }

  const user = db.users.find((u) => u.id === user_id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Withdrawable balance check: cannot withdraw locked balance
  const withdrawable = user.balance - user.exposure;
  if (withdrawable < numAmount) {
    return res.status(400).json({
      error: `Insufficient withdrawable balance! Balance: ₹${user.balance}, Active Exposure: ₹${user.exposure}. Max withdrawable: ₹${Math.max(0, withdrawable)}.`,
    });
  }

  user.balance -= numAmount;

  const tx: Transaction = {
    id: generateId('tx'),
    user_id: user.id,
    username: user.username,
    type: 'WITHDRAW',
    amount: -numAmount,
    balance_after: user.balance,
    description: `Withdrawal to ${upi_id || bank_account || 'Registered Account'}`,
    created_at: new Date().toISOString(),
  };
  db.transactions.unshift(tx);
  saveDatabase();

  const { password_hash, ...userProfile } = user;
  return res.json({
    success: true,
    message: `Withdrawal of ₹${numAmount.toLocaleString()} processed successfully!`,
    user: userProfile,
    transaction: tx,
  });
});

// GET /api/wallet/transactions?user_id=...
app.get('/api/wallet/transactions', (req, res) => {
  const userId = req.query.user_id as string;
  if (!userId) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  const txs = db.transactions.filter((t) => t.user_id === userId);
  return res.json({ success: true, transactions: txs });
});

// ----------------------------------------------------
// BANNERS APIS
// ----------------------------------------------------

app.get('/api/banners', (req, res) => {
  const activeBanners = db.banners.filter((b) => b.is_active);
  return res.json({ success: true, banners: activeBanners });
});

app.post('/api/banners', (req, res) => {
  const { title, subtitle, image_url, link, tag } = req.body;
  if (!title || !image_url) {
    return res.status(400).json({ error: 'Title and image URL are required' });
  }

  const newBanner: Banner = {
    id: generateId('bnr'),
    title: String(title).trim(),
    subtitle: String(subtitle || '').trim(),
    image_url: String(image_url).trim(),
    link: String(link || '').trim(),
    tag: String(tag || 'PROMOTION').trim().toUpperCase(),
    is_active: true,
  };

  db.banners.push(newBanner);
  saveDatabase();
  return res.json({ success: true, banner: newBanner });
});

app.delete('/api/banners/:id', (req, res) => {
  db.banners = db.banners.filter((b) => b.id !== req.params.id);
  saveDatabase();
  return res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN APIS
// ----------------------------------------------------

// 1. Overview stats
app.get('/api/admin/overview', (req, res) => {
  const totalUsers = db.users.length;
  const totalBets = db.bets.length;
  const totalVolume = db.bets.reduce((acc, b) => acc + b.stake, 0);
  const openRaces = db.races.filter((r) => r.status === 'OPEN').length;
  const pendingBetsCount = db.bets.filter((b) => b.status === 'PENDING').length;

  return res.json({
    success: true,
    stats: {
      totalUsers,
      totalBets,
      totalVolume,
      openRaces,
      pendingBetsCount,
    },
  });
});

// 2. Add Race with Horses & Odds (Manual Admin Entry)
app.post('/api/admin/races', (req, res) => {
  const { name, race_no, venue, race_time, date_str, distance, going, class_grade, horses } = req.body;

  if (!name || !race_time) {
    return res.status(400).json({ error: 'Race name and race time are required' });
  }

  const raceId = generateId('race');
  const parsedHorses: Horse[] = (horses || []).map((h: any, index: number) => {
    const sNo = Number(h.serial_no || h.horse_no) || index + 1;
    const gNo = h.gate_no !== undefined && h.gate_no !== '' ? (isNaN(Number(h.gate_no)) ? h.gate_no : Number(h.gate_no)) : (index + 1);
    return {
      id: h.id || generateId('hrs'),
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
    name: String(name).trim(),
    race_no: race_no ? Number(race_no) : undefined,
    venue: String(venue || 'Bangalore Turf Club').trim(),
    race_time: String(race_time).trim(),
    date_str: String(date_str || 'Today, 5th Sep').trim(),
    distance: String(distance || '1600m').trim(),
    going: String(going || 'Good').trim(),
    class_grade: String(class_grade || 'Grade 1 • Terms').trim(),
    status: req.body.status || 'OPEN',
    image_url: req.body.image_url || '/images/race_action.jpg',
    winner_horse_id: null,
    place_horses_ids: [],
    horses: parsedHorses,
    settled_at: null,
  };

  db.races.unshift(newRace);
  saveDatabase();
  return res.json({ success: true, race: newRace });
});

// 2b. Full Edit Race & Runners (Manual Admin Update)
app.put('/api/admin/races/:id', (req, res) => {
  const race = db.races.find((r) => r.id === req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  const { name, race_no, venue, race_time, date_str, distance, going, class_grade, horses, status, image_url } = req.body;

  if (name !== undefined) race.name = String(name).trim();
  if (race_no !== undefined) race.race_no = race_no ? Number(race_no) : undefined;
  if (venue !== undefined) race.venue = String(venue).trim();
  if (race_time !== undefined) race.race_time = String(race_time).trim();
  if (date_str !== undefined) race.date_str = String(date_str).trim();
  if (distance !== undefined) race.distance = String(distance).trim();
  if (going !== undefined) race.going = String(going).trim();
  if (class_grade !== undefined) race.class_grade = String(class_grade).trim();
  if (status !== undefined) race.status = status;
  if (image_url !== undefined) race.image_url = image_url;
  if (race_time !== undefined) race.race_time = String(race_time).trim();
  if (date_str !== undefined) race.date_str = String(date_str).trim();
  if (distance !== undefined) race.distance = String(distance).trim();
  if (going !== undefined) race.going = String(going).trim();
  if (class_grade !== undefined) race.class_grade = String(class_grade).trim();

  if (Array.isArray(horses)) {
    race.horses = horses.map((h: any, index: number) => {
      const sNo = Number(h.serial_no || h.horse_no) || index + 1;
      const gNo = h.gate_no !== undefined && h.gate_no !== '' ? (isNaN(Number(h.gate_no)) ? h.gate_no : Number(h.gate_no)) : (index + 1);
      return {
        id: h.id || generateId('hrs'),
        race_id: race.id,
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
  }

  saveDatabase();
  return res.json({ success: true, race });
});

// 2c. Delete Race Fixture
app.delete('/api/admin/races/:id', (req, res) => {
  const raceIndex = db.races.findIndex((r) => r.id === req.params.id);
  if (raceIndex === -1) return res.status(404).json({ error: 'Race not found' });

  db.races.splice(raceIndex, 1);
  db.bets = db.bets.filter((b) => b.race_id !== req.params.id);
  saveDatabase();
  return res.json({ success: true, message: 'Race deleted successfully' });
});

// 3. Edit Race Status (Open -> Closed -> Resulted)
app.put('/api/admin/races/:id/status', (req, res) => {
  const { status } = req.body;
  const race = db.races.find((r) => r.id === req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  if (!['OPEN', 'CLOSED', 'RESULTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid race status' });
  }

  race.status = status;
  saveDatabase();
  return res.json({ success: true, race });
});

// 4. Update Horse Odds
app.put('/api/admin/horses/:id/odds', (req, res) => {
  const { win_odds, place_odds } = req.body;
  let foundHorse: Horse | null = null;

  for (const race of db.races) {
    const horse = race.horses.find((h) => h.id === req.params.id);
    if (horse) {
      if (win_odds !== undefined) horse.win_odds = Number(win_odds);
      if (place_odds !== undefined) horse.place_odds = Number(place_odds);
      foundHorse = horse;
      break;
    }
  }

  if (!foundHorse) {
    return res.status(404).json({ error: 'Horse not found' });
  }

  saveDatabase();
  return res.json({ success: true, horse: foundHorse });
});

// 5. SETTLE RACE & AUTO PAYOUT BETS (CORE REQUIREMENT - WITH DEAD HEAT SUPPORT)
// Supports multi-horse dead heat for 1st, 2nd, and 3rd place with Method A (Betfair / Industry Standard) stake division
app.post('/api/admin/races/:id/settle', (req, res) => {
  const { position_1, position_2, position_3, winner_horse_id, place_horses_ids } = req.body;
  const race = db.races.find((r) => r.id === req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  // Determine positions array
  let p1: string[] = [];
  let p2: string[] = [];
  let p3: string[] = [];

  if (Array.isArray(position_1) && position_1.length > 0) {
    p1 = position_1.filter(Boolean);
    p2 = Array.isArray(position_2) ? position_2.filter(Boolean) : [];
    p3 = Array.isArray(position_3) ? position_3.filter(Boolean) : [];
  } else if (winner_horse_id) {
    p1 = [winner_horse_id];
    const placeList = Array.isArray(place_horses_ids) ? place_horses_ids : [winner_horse_id];
    p2 = placeList.filter(id => id !== winner_horse_id).slice(0, 1);
    p3 = placeList.filter(id => id !== winner_horse_id).slice(1);
  } else {
    return res.status(400).json({ error: '1st Place winner horse is required to settle race' });
  }

  if (p1.length === 0) {
    return res.status(400).json({ error: 'At least one horse must be selected for 1st Place' });
  }

  const isDeadHeatWin = p1.length > 1;
  const isDeadHeatPlace = p2.length > 1 || p3.length > 1;
  const isDeadHeat = isDeadHeatWin || isDeadHeatPlace;

  // Place multipliers calculation (Total 3 place slots)
  // For each horse, determine place qualification factor (0 to 1.0)
  const placeFactorMap = new Map<string, number>();
  let remainingSlots = 3;

  // Tier 1 (1st Place)
  if (p1.length >= 3) {
    const factor = 3 / p1.length;
    p1.forEach(hId => placeFactorMap.set(hId, factor));
    remainingSlots = 0;
  } else {
    p1.forEach(hId => placeFactorMap.set(hId, 1.0));
    remainingSlots -= p1.length;
  }

  // Tier 2 (2nd Place)
  if (remainingSlots > 0 && p2.length > 0) {
    if (p2.length <= remainingSlots) {
      p2.forEach(hId => placeFactorMap.set(hId, 1.0));
      remainingSlots -= p2.length;
    } else {
      const factor = remainingSlots / p2.length;
      p2.forEach(hId => placeFactorMap.set(hId, factor));
      remainingSlots = 0;
    }
  }

  // Tier 3 (3rd Place)
  if (remainingSlots > 0 && p3.length > 0) {
    if (p3.length <= remainingSlots) {
      p3.forEach(hId => placeFactorMap.set(hId, 1.0));
      remainingSlots -= p3.length;
    } else {
      const factor = remainingSlots / p3.length;
      p3.forEach(hId => placeFactorMap.set(hId, factor));
      remainingSlots = 0;
    }
  }

  const placeAll = [...p1, ...p2, ...p3];
  race.position_1 = p1;
  race.position_2 = p2;
  race.position_3 = p3;
  race.winner_horse_id = p1[0] || null;
  race.place_horses_ids = placeAll;
  race.is_dead_heat = isDeadHeat;
  race.dead_heat_note = isDeadHeatWin 
    ? `DEAD HEAT FOR WIN (${p1.length} Horses Tied for 1st)` 
    : isDeadHeatPlace 
    ? `DEAD HEAT FOR PLACE` 
    : undefined;
  race.status = 'RESULTED';
  race.settled_at = new Date().toISOString();

  // Find all pending bets for this race
  const pendingBets = db.bets.filter((b) => (b.race_id === race.id || b.race_name === race.name) && b.status === 'PENDING');
  let settledCount = 0;
  let totalPayout = 0;

  for (const bet of pendingBets) {
    const betUser = db.users.find((u) => u.id === bet.user_id);
    let isWon = false;
    let betPayout = 0;
    let betIsDeadHeat = false;
    let deadHeatDivider = 1;

    if (bet.bet_type === 'WIN') {
      if (p1.includes(bet.horse_id)) {
        isWon = true;
        if (p1.length > 1) {
          betIsDeadHeat = true;
          deadHeatDivider = p1.length;
          // Method A: Half Stake Win (Divide stake by N winners)
          betPayout = Math.round((bet.stake / p1.length) * bet.odds);
        } else {
          betPayout = Math.round(bet.stake * bet.odds);
        }
      }
    } else if (bet.bet_type === 'PLACE') {
      const factor = placeFactorMap.get(bet.horse_id) || 0;
      if (factor > 0) {
        isWon = true;
        if (factor < 1.0) {
          betIsDeadHeat = true;
          deadHeatDivider = Math.round(1 / factor);
          betPayout = Math.round((bet.stake * factor) * bet.odds);
        } else {
          betPayout = Math.round(bet.stake * bet.odds);
        }
      }
    }

    bet.settled_at = new Date().toISOString();

    if (isWon) {
      bet.status = 'WON';
      bet.payout = betPayout;
      bet.is_dead_heat = betIsDeadHeat;
      bet.dead_heat_divider = betIsDeadHeat ? deadHeatDivider : undefined;
      totalPayout += betPayout;

      if (betUser) {
        betUser.balance += betPayout;
        betUser.exposure = Math.max(0, betUser.exposure - bet.stake);

        const winDesc = betIsDeadHeat 
          ? `Payout WON (Dead Heat 1/${deadHeatDivider}): ${bet.bet_type} bet on #${bet.horse_no} ${bet.horse_name} in ${race.name} (₹${betPayout.toLocaleString('en-IN')})`
          : `Payout WON: ${bet.bet_type} bet on #${bet.horse_no} ${bet.horse_name} in ${race.name} (Odds: ${bet.odds})`;

        const winTx: Transaction = {
          id: generateId('tx'),
          user_id: betUser.id,
          username: betUser.username,
          type: 'WIN',
          amount: betPayout,
          balance_after: betUser.balance,
          description: winDesc,
          created_at: new Date().toISOString(),
          reference_id: bet.id,
        };
        db.transactions.unshift(winTx);
      }
    } else {
      bet.status = 'LOST';
      bet.payout = 0;
      if (betUser) {
        betUser.exposure = Math.max(0, betUser.exposure - bet.stake);
      }
    }
    settledCount++;
  }

  saveDatabase();

  const winnerNames = p1.map(id => race.horses.find(h => h.id === id)?.name || id).join(' & ');
  const message = isDeadHeatWin
    ? `🔥 DEAD HEAT Result Declared! 1st Place tied between: ${winnerNames}. ${settledCount} bets settled as per Dead Heat rules (₹${totalPayout.toLocaleString('en-IN')} paid out).`
    : `Race "${race.name}" settled with winner ${winnerNames}! ${settledCount} bets settled (₹${totalPayout.toLocaleString('en-IN')} paid out).`;

  return res.json({
    success: true,
    message,
    race,
    settledCount,
    totalPayout,
  });
});

// 6. Admin Users List
app.get('/api/admin/users', (req, res) => {
  const usersList = db.users.map(({ password_hash, ...u }) => u);
  return res.json({ success: true, users: usersList });
});

// 7. Admin All Bets List
app.get('/api/admin/bets', (req, res) => {
  return res.json({ success: true, bets: db.bets });
});

// 8. Admin Adjust User Balance (Credit/Debit / Approve Transaction)
app.post('/api/admin/users/:id/adjust-balance', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { amount, type, description } = req.body;
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid adjustment amount' });
  }

  if (type === 'DEBIT' && user.balance < numAmount) {
    return res.status(400).json({ error: 'Insufficient balance to debit' });
  }

  if (type === 'DEBIT') {
    user.balance -= numAmount;
  } else {
    user.balance += numAmount;
  }

  const newTx: Transaction = {
    id: `tx_adm_${Date.now()}`,
    user_id: user.id,
    username: user.username,
    type: type === 'DEBIT' ? 'WITHDRAW' : 'DEPOSIT',
    amount: numAmount,
    balance_after: user.balance,
    description: description || `Admin ${type === 'DEBIT' ? 'Debit' : 'Credit'} Adjustment`,
    created_at: new Date().toISOString(),
  };

  db.transactions.unshift(newTx);
  saveDatabase();

  return res.json({
    success: true,
    message: `Successfully ${type === 'DEBIT' ? 'debited' : 'credited'} ₹${numAmount} for @${user.username}`,
    user,
  });
});

// 9. Admin Reset Demo Data
app.post('/api/admin/reset-demo', (req, res) => {
  db = JSON.parse(JSON.stringify(defaultData));
  saveDatabase();
  return res.json({ success: true, message: 'Platform demo data successfully reseeded!' });
});

// ----------------------------------------------------
// 10. DEPOSIT REQUESTS API
// ----------------------------------------------------
app.post('/api/deposits', (req, res) => {
  const { userId, amount, paymentMethod, utrNumber, screenshotUrl } = req.body;
  const numAmount = Number(amount);
  if (!userId || isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ error: 'Valid user ID and minimum deposit amount of ₹100 is required' });
  }

  const user = db.users.find((u) => u.id === userId);
  const username = user?.username || 'arjun_punters';

  if (!db.deposit_requests) db.deposit_requests = [];

  const newRequest: DepositRequest = {
    id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    username,
    amount: numAmount,
    payment_method: paymentMethod || 'UPI',
    utr_number: utrNumber || `UTR${Date.now().toString().slice(-6)}`,
    screenshot_url: screenshotUrl,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    reviewed_at: null,
  };

  db.deposit_requests.unshift(newRequest);
  saveDatabase();

  return res.json({
    success: true,
    depositRequest: newRequest,
    message: `Deposit request of ₹${numAmount.toLocaleString('en-IN')} submitted! Status: PENDING Admin verification.`,
  });
});

app.get('/api/deposits', (req, res) => {
  const { user_id, status } = req.query;
  if (!db.deposit_requests) db.deposit_requests = [];

  let list = db.deposit_requests;
  if (user_id) {
    list = list.filter((d) => d.user_id === user_id);
  }
  if (status && status !== 'ALL') {
    list = list.filter((d) => d.status === status);
  }
  return res.json({ success: true, deposits: list });
});

app.post('/api/admin/deposits/:id/approve', (req, res) => {
  if (!db.deposit_requests) db.deposit_requests = [];
  const reqItem = db.deposit_requests.find((d) => d.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Deposit request not found' });

  if (reqItem.status === 'APPROVED') {
    return res.json({ success: true, message: 'Deposit request is already approved' });
  }

  const { adminNotes } = req.body;
  reqItem.status = 'APPROVED';
  reqItem.reviewed_at = new Date().toISOString();
  if (adminNotes) reqItem.admin_notes = adminNotes;

  const user = db.users.find((u) => u.id === reqItem.user_id);
  if (user) {
    user.balance += reqItem.amount;
  }

  const newTx: Transaction = {
    id: `tx_${Date.now()}_dep`,
    user_id: reqItem.user_id,
    username: reqItem.username,
    type: 'DEPOSIT',
    amount: reqItem.amount,
    balance_after: user ? user.balance : reqItem.amount,
    description: `Deposit Approved via ${reqItem.payment_method} (UTR: ${reqItem.utr_number})`,
    created_at: new Date().toISOString(),
    reference_id: reqItem.id,
  };
  db.transactions.unshift(newTx);
  saveDatabase();

  return res.json({
    success: true,
    message: `Deposit of ₹${reqItem.amount.toLocaleString('en-IN')} approved! Balance credited automatically.`,
    user,
    depositRequest: reqItem,
  });
});

app.post('/api/admin/deposits/:id/reject', (req, res) => {
  if (!db.deposit_requests) db.deposit_requests = [];
  const reqItem = db.deposit_requests.find((d) => d.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Deposit request not found' });

  const { reason } = req.body;
  reqItem.status = 'REJECTED';
  reqItem.reviewed_at = new Date().toISOString();
  reqItem.admin_notes = reason || 'UTR or proof could not be verified by Admin.';
  saveDatabase();

  return res.json({
    success: true,
    message: 'Deposit request rejected.',
    depositRequest: reqItem,
  });
});

// ----------------------------------------------------
// 11. WITHDRAWAL REQUESTS API
// ----------------------------------------------------
app.post('/api/withdrawals', (req, res) => {
  const { userId, amount, details } = req.body;
  const numAmount = Number(amount);
  if (!userId || isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ error: 'Valid user ID and minimum withdrawal amount of ₹100 is required' });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const withdrawable = (user.balance ?? 0) - (user.exposure ?? 0);
  if (withdrawable < numAmount) {
    return res.status(400).json({ error: `Insufficient withdrawable balance. Available: ₹${Math.max(0, withdrawable)}` });
  }

  user.balance -= numAmount;

  if (!db.withdrawal_requests) db.withdrawal_requests = [];

  const newRequest: WithdrawalRequest = {
    id: `wth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    username: user.username,
    amount: numAmount,
    upi_id: details?.upi_id,
    bank_account: details?.bank_account,
    ifsc: details?.ifsc,
    account_holder: details?.account_holder,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    approved_at: null,
    completed_at: null,
    estimated_minutes: 120,
  };

  db.withdrawal_requests.unshift(newRequest);

  const newTx: Transaction = {
    id: `tx_${Date.now()}_wth`,
    user_id: userId,
    username: user.username,
    type: 'WITHDRAW',
    amount: -numAmount,
    balance_after: user.balance,
    description: `Withdrawal Request (Pending Verification) to ${details?.upi_id || details?.bank_account || 'Registered Bank'}`,
    created_at: new Date().toISOString(),
    reference_id: newRequest.id,
  };
  db.transactions.unshift(newTx);
  saveDatabase();

  return res.json({
    success: true,
    withdrawalRequest: newRequest,
    user,
    message: `Withdrawal request of ₹${numAmount.toLocaleString('en-IN')} submitted! Status: PENDING Admin review.`,
  });
});

app.get('/api/withdrawals', (req, res) => {
  const { user_id, status } = req.query;
  if (!db.withdrawal_requests) db.withdrawal_requests = [];

  let list = db.withdrawal_requests;
  if (user_id) {
    list = list.filter((w) => w.user_id === user_id);
  }
  if (status && status !== 'ALL') {
    list = list.filter((w) => w.status === status);
  }
  return res.json({ success: true, withdrawals: list });
});

app.post('/api/admin/withdrawals/:id/approve', (req, res) => {
  if (!db.withdrawal_requests) db.withdrawal_requests = [];
  const reqItem = db.withdrawal_requests.find((w) => w.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Withdrawal request not found' });

  reqItem.status = 'IN_PROGRESS';
  reqItem.approved_at = new Date().toISOString();
  reqItem.estimated_minutes = 120;
  saveDatabase();

  return res.json({
    success: true,
    message: `Withdrawal of ₹${reqItem.amount.toLocaleString('en-IN')} marked as IN PROGRESS. 120-minute timer started.`,
    withdrawalRequest: reqItem,
  });
});

app.post('/api/admin/withdrawals/:id/complete', (req, res) => {
  if (!db.withdrawal_requests) db.withdrawal_requests = [];
  const reqItem = db.withdrawal_requests.find((w) => w.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Withdrawal request not found' });

  reqItem.status = 'SUCCESSFUL';
  reqItem.completed_at = new Date().toISOString();
  saveDatabase();

  return res.json({
    success: true,
    message: `Withdrawal of ₹${reqItem.amount.toLocaleString('en-IN')} marked as SUCCESSFUL / DISBURSED!`,
    withdrawalRequest: reqItem,
  });
});

app.post('/api/admin/withdrawals/:id/reject', (req, res) => {
  if (!db.withdrawal_requests) db.withdrawal_requests = [];
  const reqItem = db.withdrawal_requests.find((w) => w.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Withdrawal request not found' });

  const { reason } = req.body;
  reqItem.status = 'REJECTED';
  reqItem.admin_notes = reason || 'Rejected by Admin. Amount refunded back to wallet.';

  const user = db.users.find((u) => u.id === reqItem.user_id);
  if (user) {
    user.balance += reqItem.amount;
  }

  const newTx: Transaction = {
    id: `tx_${Date.now()}_ref`,
    user_id: reqItem.user_id,
    username: reqItem.username,
    type: 'REFUND',
    amount: reqItem.amount,
    balance_after: user ? user.balance : reqItem.amount,
    description: `Refund for Rejected Withdrawal: ${reqItem.admin_notes}`,
    created_at: new Date().toISOString(),
    reference_id: reqItem.id,
  };
  db.transactions.unshift(newTx);
  saveDatabase();

  return res.json({
    success: true,
    message: `Withdrawal rejected and ₹${reqItem.amount.toLocaleString('en-IN')} refunded to user wallet.`,
    user,
    withdrawalRequest: reqItem,
  });
});

// ----------------------------------------------------
// 12. SUSPEND / RESUME RACE & RUNNERS API
// ----------------------------------------------------
app.post('/api/admin/races/:id/suspend', (req, res) => {
  const race = db.races.find((r) => r.id === req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  race.is_suspended = true;
  if (race.horses) {
    race.horses.forEach((h) => { h.is_suspended = true; });
  }
  saveDatabase();
  return res.json({ success: true, message: `All runners in ${race.name} suspended`, race });
});

app.post('/api/admin/races/:id/resume', (req, res) => {
  const race = db.races.find((r) => r.id === req.params.id);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  race.is_suspended = false;
  if (race.horses) {
    race.horses.forEach((h) => { h.is_suspended = false; });
  }
  saveDatabase();
  return res.json({ success: true, message: `All runners in ${race.name} resumed`, race });
});

app.post('/api/admin/races/:raceId/horses/:horseId/suspend', (req, res) => {
  const race = db.races.find((r) => r.id === req.params.raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  const horse = race.horses.find((h) => h.id === req.params.horseId);
  if (!horse) return res.status(404).json({ error: 'Horse not found' });

  horse.is_suspended = true;
  saveDatabase();
  return res.json({ success: true, message: `Runner ${horse.name} suspended`, race, horse });
});

app.post('/api/admin/races/:raceId/horses/:horseId/resume', (req, res) => {
  const race = db.races.find((r) => r.id === req.params.raceId);
  if (!race) return res.status(404).json({ error: 'Race not found' });

  const horse = race.horses.find((h) => h.id === req.params.horseId);
  if (!horse) return res.status(404).json({ error: 'Horse not found' });

  const { win_odds, place_odds } = req.body;
  horse.is_suspended = false;
  if (win_odds && !isNaN(Number(win_odds))) horse.win_odds = Number(win_odds);
  if (place_odds && !isNaN(Number(place_odds))) horse.place_odds = Number(place_odds);

  saveDatabase();
  return res.json({ success: true, message: `Runner ${horse.name} resumed`, race, horse });
});

// ----------------------------------------------------
// VITE SPA MIDDLEWARE / PRODUCTION STATIC FILES
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏇 Horse Race Betting server running on http://localhost:${PORT}`);
  });
}

export { app, startServer };
export default app;

if (process.env.VERCEL !== '1' && !process.env.NOW_REGION) {
  startServer();
}
