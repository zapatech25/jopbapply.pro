#!/bin/bash

# JobApply.pro Export Script
# This script creates a production-ready export package

set -e

echo "🚀 Creating JobApply.pro export package..."

# Create export directory
EXPORT_DIR="jobapply-pro-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "📦 Copying project files..."

# Copy application files
cp -r client "$EXPORT_DIR/"
cp -r server "$EXPORT_DIR/"
cp -r shared "$EXPORT_DIR/"

# Copy configuration files
cp package.json "$EXPORT_DIR/"
cp package-lock.json "$EXPORT_DIR/"
cp tsconfig.json "$EXPORT_DIR/"
cp vite.config.ts "$EXPORT_DIR/"
cp tailwind.config.ts "$EXPORT_DIR/"
cp postcss.config.js "$EXPORT_DIR/"
cp drizzle.config.ts "$EXPORT_DIR/"
cp components.json "$EXPORT_DIR/"

# Copy deployment files
cp .env.example "$EXPORT_DIR/"
cp Dockerfile "$EXPORT_DIR/"
cp docker-compose.yml "$EXPORT_DIR/"
cp DEPLOYMENT.md "$EXPORT_DIR/"

# Copy documentation
cp replit.md "$EXPORT_DIR/README.md"

# Create directories that might be needed
mkdir -p "$EXPORT_DIR/uploads"

# Create .dockerignore
cat > "$EXPORT_DIR/.dockerignore" << 'EOF'
node_modules
dist
.env
.git
*.log
uploads/*
!uploads/.gitkeep
.replit
replit.nix
EOF

# Create .gitignore for the export
cat > "$EXPORT_DIR/.gitignore" << 'EOF'
node_modules
dist
.env
*.log
uploads/*
!uploads/.gitkeep
.DS_Store
EOF

# Create quick start script
cat > "$EXPORT_DIR/quick-start.sh" << 'EOF'
#!/bin/bash

echo "🚀 JobApply.pro Quick Start"
echo "=========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "1. Copy .env.example to .env"
    echo "2. Edit .env with your actual values"
    echo ""
    echo "Do you want to create .env from .env.example now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        cp .env.example .env
        echo "✅ .env created! Please edit it with your actual values before continuing."
        exit 0
    else
        exit 1
    fi
fi

echo "🏗️  Building and starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🗄️  Running database migrations..."
docker-compose exec app npm run db:push

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Application is running at: http://localhost:5000"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""
EOF

chmod +x "$EXPORT_DIR/quick-start.sh"

# Create database export script
cat > "$EXPORT_DIR/export-database.sh" << 'EOF'
#!/bin/bash

# Export database from running Docker container

BACKUP_FILE="database-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "📦 Exporting database to $BACKUP_FILE..."

docker-compose exec -T postgres pg_dump -U jobapply_user jobapply > "$BACKUP_FILE"

echo "✅ Database exported successfully!"
echo "📁 Backup saved to: $BACKUP_FILE"
EOF

chmod +x "$EXPORT_DIR/export-database.sh"

# Create import script
cat > "$EXPORT_DIR/import-database.sh" << 'EOF'
#!/bin/bash

# Import database backup into running Docker container

if [ -z "$1" ]; then
    echo "Usage: ./import-database.sh <backup-file.sql>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ File not found: $BACKUP_FILE"
    exit 1
fi

echo "📥 Importing database from $BACKUP_FILE..."

docker-compose exec -T postgres psql -U jobapply_user -d jobapply < "$BACKUP_FILE"

echo "✅ Database imported successfully!"
EOF

chmod +x "$EXPORT_DIR/import-database.sh"

# Create README for export
cat > "$EXPORT_DIR/EXPORT-README.md" << 'EOF'
# JobApply.pro - Export Package

This package contains everything you need to deploy JobApply.pro on your own VPS.

## Quick Start (Docker)

1. **Copy and configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your actual values
   ```

2. **Run quick start script:**
   ```bash
   ./quick-start.sh
   ```

3. **Access your application:**
   - Open http://localhost:5000

## What's Included

- ✅ Complete application source code
- ✅ Docker configuration (Dockerfile + docker-compose.yml)
- ✅ Environment variables template (.env.example)
- ✅ Deployment guide (DEPLOYMENT.md)
- ✅ Quick start scripts
- ✅ Database import/export tools

## Documentation

Read `DEPLOYMENT.md` for complete deployment instructions including:
- Docker deployment (recommended)
- Manual deployment with PM2
- NGINX reverse proxy setup
- SSL certificate configuration
- Database migration from Replit
- Monitoring and maintenance

## Requirements

- Ubuntu 22.04 (or similar Linux)
- Docker & Docker Compose (recommended)
- OR Node.js 20.x + PostgreSQL 16 (manual deployment)
- Domain name (for production)

## Environment Variables Required

Before starting, update `.env` with:
- Database credentials
- Session secret
- Stripe API keys
- Resend API key
- Your domain

## Support

For detailed instructions, see `DEPLOYMENT.md`
For application architecture, see `README.md` (replit.md)

---

**Ready to deploy? Start with `./quick-start.sh`**
EOF

echo "📝 Creating deployment summary..."

cat > "$EXPORT_DIR/DEPLOYMENT-SUMMARY.txt" << 'EOF'
═══════════════════════════════════════════════════════════
        JobApply.pro - VPS Deployment Package
═══════════════════════════════════════════════════════════

✅ PACKAGE CONTENTS:
  - Application source code (client/, server/, shared/)
  - Docker configuration (Dockerfile, docker-compose.yml)
  - Environment template (.env.example)
  - Deployment scripts (quick-start.sh, etc.)
  - Complete documentation (DEPLOYMENT.md)

🚀 QUICK START (Docker - Recommended):
  1. cd jobapply-pro-export-*
  2. cp .env.example .env
  3. nano .env  (configure your values)
  4. ./quick-start.sh

📋 REQUIRED BEFORE DEPLOYMENT:
  ✓ Stripe account + live API keys
  ✓ Resend API key (email service)
  ✓ Domain name configured
  ✓ Server with Ubuntu 22.04
  ✓ Docker installed on server

📖 FULL DOCUMENTATION:
  - Read DEPLOYMENT.md for complete guide
  - Includes: Docker setup, manual PM2 setup, NGINX config, SSL setup
  - Database migration instructions included

🔧 ENVIRONMENT VARIABLES (.env):
  Required secrets to configure:
  - DATABASE_URL / PGPASSWORD
  - SESSION_SECRET
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - VITE_STRIPE_PUBLIC_KEY
  - RESEND_API_KEY
  
🗄️ DATABASE MIGRATION:
  - Export from Replit: Use Database → Export
  - Import to VPS: ./import-database.sh backup.sql

🌐 AFTER DEPLOYMENT:
  1. Update Stripe webhook URL to: https://yourdomain.com/api/payment/webhook
  2. Configure NGINX reverse proxy (see DEPLOYMENT.md)
  3. Setup SSL with Let's Encrypt (see DEPLOYMENT.md)
  4. Test application thoroughly

═══════════════════════════════════════════════════════════
           All files ready for VPS deployment!
═══════════════════════════════════════════════════════════
EOF

# Create archive
echo "📦 Creating archive..."
tar -czf "${EXPORT_DIR}.tar.gz" "$EXPORT_DIR"

echo ""
echo "✅ Export complete!"
echo ""
echo "📦 Package created: ${EXPORT_DIR}.tar.gz"
echo "📁 Directory: $EXPORT_DIR/"
echo ""
echo "Next steps:"
echo "1. Download ${EXPORT_DIR}.tar.gz to your local machine"
echo "2. Upload to your VPS server"
echo "3. Extract: tar -xzf ${EXPORT_DIR}.tar.gz"
echo "4. Follow DEPLOYMENT.md for setup instructions"
echo ""
