// test-env.js
const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());
console.log('Files in current directory:');
fs.readdirSync('.').forEach(file => {
  console.log(' -', file);
});

console.log('\n.env.local content:');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log(envContent);
} catch (error) {
  console.log('Error reading .env.local:', error.message);
}