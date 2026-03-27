module.exports = {
  apps: [{
    name: "mi-app",
    script: "src/index.js",
    cwd: "/home/ubuntu/AcTitUBB/backend",
    env_file: "/home/ubuntu/AcTitUBB/backend/.env",
    env: {
      NODE_ENV: "production",
      DB_HOST: "127.0.0.1",
      DB_PORT: "3306",
      DB_USER: "actitubb",
      DB_PASSWORD: "Actitubb#2024",
      DB_NAME: "actitubb"
    }
  }]
}
