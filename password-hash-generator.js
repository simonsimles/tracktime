#!/usr/bin/env node

/**
 * Password hash generator for TrackTime authentication setup.
 * This script uses bcrypt to hash a password for storage in data/config.json
 *
 * Usage:
 *   node password-hash-generator.js mypassword
 *   node password-hash-generator.js  (prompts for password interactively)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Try to use bcryptjs (pure JS, no native dependencies)
// Falls back to a basic hash if bcryptjs is not available
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  console.log('Note: bcryptjs not installed. Install with: npm install bcryptjs --save-dev');
  console.log('Using basic crypto hash instead (less secure, for testing only)\n');
  bcrypt = null;
}

const readline = require('readline');

async function hashPassword(password) {
  if (!bcrypt) {
    // Fallback: simple hash (NOT for production)
    console.warn('⚠️  WARNING: Using non-bcrypt hash. This is NOT secure for production.');
    return '$2a$12$' + crypto.createHash('sha256').update(password).digest('hex').substring(0, 53);
  }
  
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  let password = process.argv[2];

  // If password not provided as argument, prompt for it
  if (!password) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    password = await new Promise((resolve) => {
      rl.question('Enter password to hash: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  if (!password || password.trim().length === 0) {
    console.error('❌ Error: Password cannot be empty');
    process.exit(1);
  }

  try {
    const hash = await hashPassword(password);

    console.log('\n✓ Password hash generated successfully!\n');
    console.log('Hash (copy this):');
    console.log(hash);
    console.log('\n' + '='.repeat(80));
    console.log('\nTo set up authentication:');
    console.log('1. Open: data/config.json');
    console.log('2. Add or update the "hashedPassword" field with the hash above');
    console.log('3. Example:');
    console.log('   {');
    console.log('     "secretKey": "...",');
    console.log(`     "hashedPassword": "${hash}"`);
    console.log('   }');
    console.log('\n4. Restart the TrackTime application');
    console.log('5. Login with your password in the web interface\n');
  } catch (err) {
    console.error('❌ Error hashing password:', err.message);
    process.exit(1);
  }
}

main();
