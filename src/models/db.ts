import mongoose from 'mongoose';
import {
  UserModel,
  RaceModel,
  BetModel,
  TransactionModel,
  BannerModel,
  RaceCenterModel,
  RaceDayModel,
  DepositRequestModel,
  WithdrawalRequestModel,
} from './index';

let isConnected = false;

export async function connectMongoDB(uri?: string): Promise<boolean> {
  const mongoUri = uri || process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    console.log('ℹ️ No MONGODB_URI found in environment. Running in JSON persistence mode.');
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('✅ Connected to MongoDB successfully! Collections active: users, races, horses, bets, transactions, banners');
    return true;
  } catch (err: any) {
    console.error('⚠️ MongoDB connection error:', err.message);
    isConnected = false;
    return false;
  }
}

export function isMongoDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Helpers to sync memory DB to MongoDB
export async function syncMemoryToMongoDB(db: {
  users?: any[];
  races?: any[];
  bets?: any[];
  transactions?: any[];
  banners?: any[];
  race_centers?: any[];
  race_days?: any[];
  deposit_requests?: any[];
  withdrawal_requests?: any[];
}) {
  if (!isMongoDBConnected()) return;

  try {
    if (db.users?.length) {
      for (const u of db.users) {
        await UserModel.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      }
    }
    if (db.races?.length) {
      for (const r of db.races) {
        await RaceModel.findOneAndUpdate({ id: r.id }, r, { upsert: true, new: true });
      }
    }
    if (db.bets?.length) {
      for (const b of db.bets) {
        await BetModel.findOneAndUpdate({ id: b.id }, b, { upsert: true, new: true });
      }
    }
    if (db.transactions?.length) {
      for (const t of db.transactions) {
        await TransactionModel.findOneAndUpdate({ id: t.id }, t, { upsert: true, new: true });
      }
    }
    if (db.banners?.length) {
      for (const bn of db.banners) {
        await BannerModel.findOneAndUpdate({ id: bn.id }, bn, { upsert: true, new: true });
      }
    }
    if (db.race_centers?.length) {
      for (const rc of db.race_centers) {
        await RaceCenterModel.findOneAndUpdate({ id: rc.id }, rc, { upsert: true, new: true });
      }
    }
    if (db.race_days?.length) {
      for (const rd of db.race_days) {
        await RaceDayModel.findOneAndUpdate({ id: rd.id }, rd, { upsert: true, new: true });
      }
    }
    if (db.deposit_requests?.length) {
      for (const d of db.deposit_requests) {
        await DepositRequestModel.findOneAndUpdate({ id: d.id }, d, { upsert: true, new: true });
      }
    }
    if (db.withdrawal_requests?.length) {
      for (const w of db.withdrawal_requests) {
        await WithdrawalRequestModel.findOneAndUpdate({ id: w.id }, w, { upsert: true, new: true });
      }
    }
  } catch (err: any) {
    console.error('⚠️ Error syncing memory to MongoDB:', err.message);
  }
}

// Helpers to load data from MongoDB
export async function loadDataFromMongoDB() {
  if (!isMongoDBConnected()) return null;

  try {
    const users = await UserModel.find({}).lean();
    const races = await RaceModel.find({}).lean();
    const bets = await BetModel.find({}).lean();
    const transactions = await TransactionModel.find({}).lean();
    const banners = await BannerModel.find({}).lean();
    const race_centers = await RaceCenterModel.find({}).lean();
    const race_days = await RaceDayModel.find({}).lean();
    const deposit_requests = await DepositRequestModel.find({}).lean();
    const withdrawal_requests = await WithdrawalRequestModel.find({}).lean();

    if (users.length > 0 || races.length > 0) {
      return {
        users,
        races,
        bets,
        transactions,
        banners,
        race_centers,
        race_days,
        deposit_requests,
        withdrawal_requests,
      };
    }
    return null;
  } catch (err: any) {
    console.error('⚠️ Error loading from MongoDB:', err.message);
    return null;
  }
}
