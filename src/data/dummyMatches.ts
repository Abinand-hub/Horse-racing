import { Banner, Bet, Race, User } from '../types';

export const DUMMY_USER: User = {
  id: 'usr_admin',
  ref_id: '100001',
  full_name: 'Turf Derby Master',
  phone: '9999988888',
  email: 'admin@derbybet.turf',
  username: 'derby_admin',
  role: 'admin',
  balance: 500000,
  exposure: 0,
  profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  created_at: '2026-08-11T12:24:18.825Z',
};

export const DUMMY_RACES: Race[] = [];

export const DUMMY_BANNERS: Banner[] = [
  {
    id: 'bnr_01',
    title: 'Bangalore Derby 2026',
    subtitle: 'Official Live Wagering • Place Win & Place Bets with Live Odds',
    image_url: '/images/race_action.jpg',
    link: '#races',
    tag: 'TURF TACTICS',
    is_active: true,
  },
  {
    id: 'bnr_02',
    title: 'Live Racing In-Play',
    subtitle: 'Real-time Odds, Fast UPI Deposits & Instant Verified Payouts',
    image_url: '/images/jockey_hero.jpg',
    link: '#races',
    tag: 'LIVE ODDS',
    is_active: true,
  },
];

export const DUMMY_BETS: Bet[] = [];
