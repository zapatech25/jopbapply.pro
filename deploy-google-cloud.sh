#!/bin/bash
# JobApply.pro - Google Cloud Run Deployment Script
# This script deploys your app to Google Cloud Run + Cloud SQL

set -e

echo "🚀 JobApply.pro - Google Cloud Deployment"
echo "=========================================="

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
REGION="us-central1"
SERVICE_NAME="jobapply-pro"
DB_INSTANCE="jobapply-db"
DB_NAME="jobapply_production"
DB_USER="postgres"

echo ""
echo "📋 Configuration:"
echo "  Project ID:  $PROJECT_ID"
echo "  Region:      $REGION"
echo "  Service:     $SERVICE_NAME"
echo "  Database:    $DB_INSTANCE"
echo ""

# Step 1: Set project
echo "1️⃣  Setting Google Cloud project..."
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo "2️⃣  Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com

# Step 3: Create Cloud SQL instance (if it doesn't exist)
echo "3️⃣  Creating Cloud SQL PostgreSQL instance..."
if gcloud sql instances describe $DB_INSTANCE 2>/dev/null; then
  echo "  ✓ Database instance already exists"
else
  gcloud sql instances create $DB_INSTANCE \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password=$DB_PASSWORD
  echo "  ✓ Database instance created"
fi

# Step 4: Create database
echo "4️⃣  Creating database..."
gcloud sql databases create $DB_NAME \
  --instance=$DB_INSTANCE || echo "  ✓ Database already exists"

# Step 5: Import database (if export file exists)
if [ -f "database_export_20251102_203654.sql" ]; then
  echo "5️⃣  Importing database..."
  # Upload to Cloud Storage bucket (create if needed)
  BUCKET_NAME="${PROJECT_ID}-db-imports"
  gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME/ 2>/dev/null || true
  gsutil cp database_export_20251102_203654.sql gs://$BUCKET_NAME/
  
  # Import
  gcloud sql import sql $DB_INSTANCE \
    gs://$BUCKET_NAME/database_export_20251102_203654.sql \
    --database=$DB_NAME
  echo "  ✓ Database imported"
else
  echo "5️⃣  Skipping database import (no export file found)"
fi

# Step 6: Deploy to Cloud Run
echo "6️⃣  Deploying application to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances ${PROJECT_ID}:${REGION}:${DB_INSTANCE} \
  --set-env-vars "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE}" \
  --set-env-vars "SESSION_SECRET=${SESSION_SECRET}" \
  --set-env-vars "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" \
  --set-env-vars "VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}" \
  --set-env-vars "RESEND_API_KEY=${RESEND_API_KEY}" \
  --set-env-vars "NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Your app is now live at:"
gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)'
echo ""
echo "📊 Next steps:"
echo "  1. Update Stripe webhook URL to point to your new domain"
echo "  2. Configure custom domain (optional)"
echo "  3. Set up monitoring and alerts"
echo ""
