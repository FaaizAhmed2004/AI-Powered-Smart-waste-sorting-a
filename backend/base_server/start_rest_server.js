#!/usr/bin/env node
/**
 * Simple script to start the REST API server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Waste Sort REST API Server...');
console.log('Server will be available at: http://localhost:3000');
console.log('API base URL: http://localhost:3000/v1');
console.log('Press Ctrl+C to stop the server\n');

// Change to the base_server directory
process.chdir(__dirname);

// Start the development server
const server = spawn('npm', ['run', 'start:dev'], {
    stdio: 'inherit',
    shell: true
});

server.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\nShutting down server...');
    server.kill('SIGTERM');
});