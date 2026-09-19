import 'dotenv/config';
import mongoose from 'mongoose';
import {
  UserModel,
  RaceModel,
  BetModel,
  TransactionModel,
  DepositRequestModel,
  WithdrawalRequestModel,
  RaceCenterModel,
  RaceDayModel,
  OtpModel,
} from '../src/models/index';

async function checkMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }
  console.log(`Testing connection to: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connection to MongoDB Atlas SUCCESSFUL!');

    const counts = {
      users: await UserModel.countDocuments(),
      races: await RaceModel.countDocuments(),
      bets: await BetModel.countDocuments(),
      transactions: await TransactionModel.countDocuments(),
      deposits: await DepositRequestModel.countDocuments(),
      withdrawals: await WithdrawalRequestModel.countDocuments(),
      raceCenters: await RaceCenterModel.countDocuments(),
      raceDays: await RaceDayModel.countDocuments(),
      otps: await OtpModel.countDocuments(),
    };

    console.log('📊 Current Live Database Stats:', JSON.stringify(counts, null, 2));
    await mongoose.disconnect();
    console.log('✅ Test finished cleanly.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
    process.exit(1);
  }
}

checkMongo();
