import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import {
  UserModel,
  RaceModel,
  HorseModel,
  BetModel,
  TransactionModel,
  BannerModel,
  RaceCenterModel,
  RaceDayModel,
  DepositRequestModel,
  WithdrawalRequestModel,
} from '../models/index';

async function seedMongoDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/derbybet';
  console.log(`🔌 Connecting to MongoDB: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}...`);

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully.');

    const dataPath = path.join(process.cwd(), 'data', 'database.json');
    if (!fs.existsSync(dataPath)) {
      console.error('❌ database.json not found at', dataPath);
      process.exit(1);
    }

    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);

    console.log('🧹 Purging old dummy data from MongoDB collections...');
    
    // Wipe all previous dummy matches, horses, bets, transactions, deposit & withdrawal requests
    await RaceModel.deleteMany({});
    await HorseModel.deleteMany({});
    await BetModel.deleteMany({});
    await TransactionModel.deleteMany({});
    await DepositRequestModel.deleteMany({});
    await WithdrawalRequestModel.deleteMany({});
    // Remove dummy users (keep none or only re-seed fresh admin)
    await UserModel.deleteMany({});
    await BannerModel.deleteMany({});
    await RaceCenterModel.deleteMany({});
    await RaceDayModel.deleteMany({});

    console.log('  ✓ Purged old races, horses, bets, transactions, requests, and non-admin users.');

    console.log('📦 Seeding fresh clean baseline collections...');

    if (data.users?.length) {
      for (const u of data.users) {
        await UserModel.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${data.users.length} admin user(s) into 'users' collection`);
    }

    if (data.races?.length) {
      for (const r of data.races) {
        await RaceModel.findOneAndUpdate({ id: r.id }, r, { upsert: true, new: true });
        if (r.horses?.length) {
          for (const h of r.horses) {
            await HorseModel.findOneAndUpdate({ id: h.id }, { ...h, race_id: r.id }, { upsert: true, new: true });
          }
        }
      }
      console.log(`  ✓ Seeded ${data.races.length} races into 'races' & 'horses' collections`);
    } else {
      console.log('  ✓ Races collection initialized empty (ready for admin to add real races).');
    }

    if (data.bets?.length) {
      for (const b of data.bets) {
        await BetModel.findOneAndUpdate({ id: b.id }, b, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${data.bets.length} bets into 'bets' collection`);
    } else {
      console.log('  ✓ Bets collection initialized empty.');
    }

    if (data.transactions?.length) {
      for (const t of data.transactions) {
        await TransactionModel.findOneAndUpdate({ id: t.id }, t, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${data.transactions.length} transactions into 'transactions' collection`);
    } else {
      console.log('  ✓ Transactions collection initialized empty.');
    }

    if (data.banners?.length) {
      for (const bn of data.banners) {
        await BannerModel.findOneAndUpdate({ id: bn.id }, bn, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${data.banners.length} banners into 'banners' collection`);
    }

    if (data.race_centers?.length) {
      for (const rc of data.race_centers) {
        await RaceCenterModel.findOneAndUpdate({ id: rc.id }, rc, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${data.race_centers.length} race centers into 'race_centers' collection`);
    }

    if (data.race_days?.length) {
      for (const rd of data.race_days) {
        await RaceDayModel.findOneAndUpdate({ id: rd.id }, rd, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${data.race_days.length} race days into 'race_days' collection`);
    }

    console.log('🎉 MongoDB database successfully initialized fresh with clean collections!');
  } catch (err: any) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seedMongoDB();
