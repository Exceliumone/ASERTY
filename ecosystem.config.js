/**
 * PM2 process definitions for bare-metal VPS deployment (no Docker).
 * See docs/VPS_GUIDE.md for the full setup. Assumes both apps have already
 * been built (`pnpm build`) and Prisma migrations applied.
 */
module.exports = {
  apps: [
    {
      name: 'pablo-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: '../../logs/api-out.log',
      error_file: '../../logs/api-error.log',
      time: true,
    },
    {
      name: 'pablo-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: '../../logs/web-out.log',
      error_file: '../../logs/web-error.log',
      time: true,
    },
  ],
};
