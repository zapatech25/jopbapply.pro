# JobApply.pro - VPS Deployment Guide

Complete guide for deploying JobApply.pro on your own VPS server (Ubuntu 22.04).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Method 1: Docker Deployment (Recommended)](#method-1-docker-deployment-recommended)
3. [Method 2: Manual Deployment](#method-2-manual-deployment)
4. [NGINX Reverse Proxy Setup](#nginx-reverse-proxy-setup)
5. [SSL Certificate with Let's Encrypt](#ssl-certificate-with-lets-encrypt)
6. [Database Migration](#database-migration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 22.04 LTS (or similar)
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **CPU**: 2 cores recommended
- **Domain**: A registered domain pointing to your server IP

### Required Accounts & Keys
Before deployment, ensure you have:
- ✅ Stripe account (live keys)
- ✅ Resend API key (for emails)
- ✅ Database backup (if migrating from Replit)
- ✅ Domain name configured

---

## Method 1: Docker Deployment (Recommended)

### Step 1: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group
sudo usermod -aG docker $USER

# Restart shell or log out/in for group changes to take effect
newgrp docker
```

### Step 2: Download & Extract Project

```bash
# Create application directory
mkdir -p /var/www/jobapply
cd /var/www/jobapply

# Upload your project files here (via SCP, Git, or ZIP)
# Example with Git:
# git clone https://github.com/yourusername/jobapply-pro.git .

# Or upload ZIP and extract:
# unzip jobapply-pro.zip
```

### Step 3: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit with your actual values
nano .env
```

**Required values to update in `.env`:**
```bash
# Database (auto-created by Docker, just set password)
PGPASSWORD=your_super_secure_password_here

# Session secret (generate random 32+ char string)
SESSION_SECRET=your_random_32_character_secret_here

# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
VITE_STRIPE_PUBLIC_KEY=pk_live_your_public_key_here

# Resend API
RESEND_API_KEY=re_your_actual_resend_key_here

# Your domain
PRODUCTION_DOMAIN=https://yourdomain.com
```

**Generate Session Secret:**
```bash
openssl rand -base64 32
```

### Step 4: Build & Start with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 5: Initialize Database

```bash
# Wait for database to be ready (30 seconds)
sleep 30

# Run database migrations
docker-compose exec app npm run db:push

# (Optional) Seed initial data if needed
# docker-compose exec app npm run db:seed
```

### Step 6: Verify Deployment

```bash
# Check if app is responding
curl http://localhost:5000/api/health

# Should return: {"status":"ok"}
```

✅ **Your application is now running on port 5000!**

---

## Method 2: Manual Deployment

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x
npm --version

# Install PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Create Database User

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql:
CREATE USER jobapply_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE jobapply OWNER jobapply_user;
GRANT ALL PRIVILEGES ON DATABASE jobapply TO jobapply_user;
\q
```

### Step 3: Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/jobapply
sudo chown $USER:$USER /var/www/jobapply
cd /var/www/jobapply

# Upload/clone your project here
# git clone ... or upload files

# Install dependencies
npm ci --only=production

# Build the application
npm run build
```

### Step 4: Configure Environment

```bash
# Create .env file
nano .env
```

Paste your environment variables (see `.env.example`).

### Step 5: Run Database Migrations

```bash
npm run db:push
```

### Step 6: Start with PM2

```bash
# Start application
pm2 start npm --name "jobapply" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check status
pm2 status
pm2 logs jobapply
```

---

## NGINX Reverse Proxy Setup

### Install NGINX

```bash
sudo apt install -y nginx
```

### Configure NGINX

```bash
sudo nano /etc/nginx/sites-available/jobapply
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS (after SSL is setup)
    # return 301 https://$server_name$request_uri;

    # For now, proxy to app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase max body size for file uploads
    client_max_body_size 50M;
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/jobapply /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts and choose to redirect HTTP to HTTPS

# Auto-renewal is setup automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## Database Migration

### Export from Replit

1. In Replit, go to Database tab
2. Click "Export" to get SQL dump
3. Save as `backup.sql`

### Import to VPS

```bash
# Upload backup.sql to your server

# Restore database
psql -U jobapply_user -d jobapply < backup.sql

# Or with Docker:
docker-compose exec -T postgres psql -U jobapply_user -d jobapply < backup.sql
```

---

## Monitoring & Maintenance

### View Logs

**Docker:**
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

**PM2:**
```bash
pm2 logs jobapply
pm2 monit
```

### Restart Services

**Docker:**
```bash
docker-compose restart app
```

**PM2:**
```bash
pm2 restart jobapply
```

### Update Application

```bash
cd /var/www/jobapply

# Pull latest code
git pull

# Install dependencies
npm ci

# Rebuild
npm run build

# Restart
docker-compose restart app
# OR
pm2 restart jobapply
```

### Backup Database

```bash
# Create backup directory
mkdir -p /var/backups/jobapply

# Backup with Docker
docker-compose exec postgres pg_dump -U jobapply_user jobapply > /var/backups/jobapply/backup-$(date +%Y%m%d).sql

# Or manual
pg_dump -U jobapply_user jobapply > /var/backups/jobapply/backup-$(date +%Y%m%d).sql

# Setup automated backups (crontab)
crontab -e

# Add this line for daily backups at 2am:
0 2 * * * docker-compose -f /var/www/jobapply/docker-compose.yml exec -T postgres pg_dump -U jobapply_user jobapply > /var/backups/jobapply/backup-$(date +\%Y\%m\%d).sql
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs app
# OR
pm2 logs jobapply

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port 5000 already in use
```

### Database connection errors

```bash
# Test database connection
psql -U jobapply_user -d jobapply -h localhost

# Check if PostgreSQL is running
sudo systemctl status postgresql
# OR
docker-compose ps postgres
```

### NGINX errors

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart NGINX
sudo systemctl restart nginx
```

### Stripe webhooks not working

1. Update webhook URL in Stripe Dashboard:
   - Go to: Developers → Webhooks
   - Update endpoint to: `https://yourdomain.com/api/payment/webhook`
   - Copy new webhook secret to `.env`
   - Restart application

---

## Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Database migrated and tested
- [ ] SSL certificate installed
- [ ] Domain DNS configured correctly
- [ ] Stripe webhook URL updated
- [ ] Email service (Resend) tested
- [ ] Application health check passing
- [ ] Backups configured
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] Monitoring setup

---

## Security Recommendations

```bash
# Setup UFW firewall
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable

# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Keep system updated
sudo apt update && sudo apt upgrade -y
```

---

## Support

For issues or questions:
- Email: support@jobapply.pro
- Check application logs
- Review Replit.md for architecture details

---

**Congratulations! Your JobApply.pro application is now running on your VPS! 🎉**
