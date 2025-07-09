const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Todo App Development Environment...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Start backend
log('📡 Starting Backend Server...', 'blue');
const backend = spawn('npm', ['run', 'backend'], {
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Server running on port')) {
    log('✅ Backend server is running on http://localhost:3000', 'green');
  }
  process.stdout.write(`${colors.blue}[Backend]${colors.reset} ${output}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`${colors.red}[Backend Error]${colors.reset} ${data}`);
});

// Start frontend after a short delay
setTimeout(() => {
  log('📱 Starting Frontend (Expo)...', 'cyan');
  const frontend = spawn('npm', ['run', 'frontend'], {
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Metro waiting on')) {
      log('✅ Frontend is ready!', 'green');
      log('📋 Available commands:', 'yellow');
      log('   • Press "a" to open Android emulator', 'reset');
      log('   • Press "i" to open iOS simulator', 'reset');
      log('   • Press "w" to open in web browser', 'reset');
      log('   • Press "r" to reload the app', 'reset');
      log('   • Press "m" to toggle menu', 'reset');
      log('   • Press "j" to open debugger', 'reset');
    }
    process.stdout.write(`${colors.cyan}[Frontend]${colors.reset} ${output}`);
  });

  frontend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}[Frontend Error]${colors.reset} ${data}`);
  });

  frontend.on('close', (code) => {
    log(`Frontend process exited with code ${code}`, 'yellow');
  });
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Shutting down development environment...', 'yellow');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Shutting down development environment...', 'yellow');
  backend.kill('SIGTERM');
  process.exit(0);
});

backend.on('close', (code) => {
  log(`Backend process exited with code ${code}`, 'yellow');
  process.exit(code);
}); 