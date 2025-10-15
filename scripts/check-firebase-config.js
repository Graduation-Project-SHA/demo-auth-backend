#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 * يساعد في التحقق من صحة إعدادات Firebase
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.development');
dotenv.config({ path: envPath });

function checkFirebaseConfig() {
  console.log('🔥 Firebase Configuration Checker\n');

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  console.log('📋 Checking configuration...\n');

  // Check Project ID
  if (!projectId) {
    console.log('❌ FIREBASE_PROJECT_ID is missing');
  } else {
    console.log('✅ FIREBASE_PROJECT_ID:', projectId);
  }

  // Check Client Email
  if (!clientEmail) {
    console.log('❌ FIREBASE_CLIENT_EMAIL is missing');
  } else {
    console.log('✅ FIREBASE_CLIENT_EMAIL:', clientEmail);
  }

  // Check Private Key
  if (!privateKey) {
    console.log('❌ FIREBASE_PRIVATE_KEY is missing');
  } else {
    console.log('✅ FIREBASE_PRIVATE_KEY found');

    // Validate private key format
    const cleanKey = privateKey
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    console.log('🔍 Private Key Analysis:');
    console.log('   Length:', cleanKey.length, 'characters');
    console.log(
      '   Has BEGIN marker:',
      cleanKey.includes('-----BEGIN PRIVATE KEY-----') ? '✅' : '❌',
    );
    console.log(
      '   Has END marker:',
      cleanKey.includes('-----END PRIVATE KEY-----') ? '✅' : '❌',
    );
    console.log('   Has newlines:', cleanKey.includes('\n') ? '✅' : '❌');

    if (
      cleanKey.includes('-----BEGIN PRIVATE KEY-----') &&
      cleanKey.includes('-----END PRIVATE KEY-----') &&
      cleanKey.includes('\n')
    ) {
      console.log('✅ Private key format appears correct');
    } else {
      console.log('❌ Private key format might be incorrect');
      console.log('\n🛠️  Private Key Formatting Guide:');
      console.log(
        '1. Copy the entire key from Firebase Console (including BEGIN/END lines)',
      );
      console.log('2. Replace all actual newlines with \\n');
      console.log('3. Wrap the entire thing in double quotes');
      console.log('\nExample:');
      console.log(
        'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"',
      );
    }
  }

  console.log('\n' + '='.repeat(60));

  if (!projectId || !clientEmail || !privateKey) {
    console.log(
      '❌ Configuration incomplete - Firebase notifications will be disabled',
    );
    console.log('\n📝 To fix:');
    console.log(
      '1. Go to Firebase Console → Project Settings → Service Accounts',
    );
    console.log('2. Click "Generate new private key"');
    console.log('3. Download the JSON file');
    console.log('4. Extract projectId, client_email, and private_key');
    console.log('5. Add them to your .env.development file');
  } else {
    console.log('✅ All required configuration present');
    console.log('🚀 Firebase notifications should work');
  }
}

// Test Firebase initialization
function testFirebaseInit() {
  console.log('\n🧪 Testing Firebase Initialization...\n');

  try {
    const admin = require('firebase-admin');

    if (admin.apps.length > 0) {
      console.log('⚠️  Firebase app already initialized, deleting...');
      admin.app().delete();
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
      /^["']|["']$/g,
      '',
    )
      .replace(/\\n/g, '\n')
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase initialized successfully!');
    console.log('✅ Push notifications should work');

    // Clean up
    admin.app().delete();
  } catch (error) {
    console.log('❌ Firebase initialization failed:');
    console.log('   Error:', error.message);

    if (error.message.includes('private key')) {
      console.log('\n🔧 Private Key Issues:');
      console.log('- Make sure the key includes BEGIN and END markers');
      console.log('- Replace actual newlines with \\n in the .env file');
      console.log('- Wrap the entire key in double quotes');
    }
  }
}

// Run checks
checkFirebaseConfig();

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  testFirebaseInit();
} else {
  console.log(
    '\n⏭️  Skipping Firebase initialization test due to missing configuration',
  );
}
