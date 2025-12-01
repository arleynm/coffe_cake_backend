// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'coffe-cake-api',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3007,
        // Se preferir, pode fixar a porta aqui: PORT: 3000,
      },
      // Boas práticas:
      instances: 1,          // ou 'max' p/ cluster
      exec_mode: 'fork',     // ou 'cluster'
      watch: false,          // true só em dev
      autorestart: true,
      max_memory_restart: '512M',
      out_file: '/var/log/pm2/coffe-api-out.log',
      error_file: '/var/log/pm2/coffe-api-error.log',
      time: true,
    },
  ],
};
