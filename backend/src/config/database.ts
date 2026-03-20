import mongoose from 'mongoose';

function isTruthy(value?: string): boolean {
  return String(value || '').toLowerCase() === 'true';
}

async function tryConnect(uri: string): Promise<void> {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });
}

export async function connectDatabase(): Promise<boolean> {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';
  const fallbackUri = process.env.MONGODB_FALLBACK_URI?.trim();
  const allowStartWithoutDb = isTruthy(process.env.ALLOW_START_WITHOUT_DB);

  try {
    await tryConnect(primaryUri);
    console.log('✅ MongoDB connected');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error (primary):', error);

    if (fallbackUri && fallbackUri !== primaryUri) {
      try {
        await tryConnect(fallbackUri);
        console.log('✅ MongoDB connected (fallback)');
        return true;
      } catch (fallbackError) {
        console.error('❌ MongoDB connection error (fallback):', fallbackError);
      }
    }

    if (allowStartWithoutDb) {
      console.warn('⚠️ Starting server without database because ALLOW_START_WITHOUT_DB=true');
      return false;
    }

    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
}

export default mongoose;
