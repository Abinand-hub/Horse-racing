export type BetType = 'WIN' | 'PLACE';
export type BetStatus = 'PENDING' | 'WON' | 'LOST';
export type RaceStatus = 'DRAFT' | 'UPCOMING' | 'OPEN' | 'LIVE' | 'CLOSED' | 'RESULTED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'REFUND';

export interface User {
  id: string;
  ref_id?: string;
  full_name?: string;
  phone: string;
  email?: string;
  password?: string;
  username: string;
  role: 'user' | 'admin';
  balance: number;
  exposure: number;
  profile_photo?: string;
  created_at: string;
}

export interface Horse {
  id: string;
  race_id: string;
  horse_no: number; // Serial number (S.No)
  serial_no?: number; // Explicit serial number
  gate_no: number | string; // Gate number (Draw / Barrier)
  name: string; // Name of the horse
  jockey: string; // Name of the jockey
  trainer: string; // Name of the trainer
  win_odds: number;
  place_odds: number;
  silk_color?: string;
  form?: string;
  weight?: string;
}

export interface Race {
  id: string;
  name: string; // Name of the race / cup
  race_no?: number | string; // Race number (e.g. Race 7)
  venue: string;
  race_time: string; // Time (e.g. 1:45 PM)
  date_str: string;
  distance: string; // Distance (e.g. 1600m)
  going?: string;
  class_grade?: string;
  status: RaceStatus;
  image_url?: string;
  winner_horse_id?: string | null;
  place_horses_ids?: string[]; // IDs of horses in 1st, 2nd, 3rd
  horses: Horse[];
  settled_at?: string | null;
}

export interface Bet {
  id: string;
  user_id: string;
  username?: string;
  race_id: string;
  race_name: string;
  venue: string;
  horse_id: string;
  horse_name: string;
  horse_no: number; // Serial number
  serial_no?: number;
  gate_no?: number | string;
  jockey?: string;
  trainer?: string;
  bet_type: BetType;
  odds: number;
  stake: number;
  potential_win: number;
  payout?: number;
  status: BetStatus;
  placed_at: string;
  settled_at?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  username?: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  reference_id?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  tag?: string;
  is_active: boolean;
}

export interface BetSlipState {
  race: Race;
  horse: Horse;
  bet_type: BetType;
  odds: number;
  stake: number;
}
