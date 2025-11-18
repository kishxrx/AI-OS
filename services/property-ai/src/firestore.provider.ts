import { Logger, Provider } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

export const FIRESTORE = 'FIRESTORE';

const firestoreFactory = {
  provide: FIRESTORE,
  useFactory: () => {
    const logger = new Logger('FirestoreProvider');
    logger.log('Initializing Firestore...');
    // TODO: Configure Firestore with project ID and credentials
    // For local development, ensure GOOGLE_APPLICATION_CREDENTIALS
    // environment variable is set, or provide credentials directly.
    const firestore = new Firestore();
    logger.log('Firestore initialized.');
    return firestore;
  },
};

export const firestoreProvider: Provider = firestoreFactory;
