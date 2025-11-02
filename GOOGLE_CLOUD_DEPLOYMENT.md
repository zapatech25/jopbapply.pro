# Google Cloud Deployment Guide

Complete guide to deploying JobApply.pro on Google Cloud Platform.

## Prerequisites

1. **Google Cloud Account**
   - Create account at https://cloud.google.com
   - $300 free credit for new users (valid 90 days)
   - Enable billing (required even for free tier)

2. **Install Google Cloud CLI**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk

   # Linux
   curl https://sdk.cloud.google.com | bash

   # Windows
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

3. **Authenticate**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

## Quick Deployment (3 Commands)

### Option 1: Automated Script

```bash
# Set environment variables
export GOOGLE_CLOUD_PROJECT="your-project-id"
export DB_PASSWORD="your-secure-password"
export SESSION_SECRET="your-session-secret"
export STRIPE_SECRET_KEY="your-stripe-key"
export VITE_STRIPE_PUBLIC_KEY="your-stripe-public-key"
export RESEND_API_KEY="your-resend-key"

# Run deployment script
chmod +x deploy-google-cloud.sh
./deploy-google-cloud.sh
```

### Option 2: Manual Commands

```bash
# 1. Deploy application
gcloud run deploy jobapply-pro \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# 2. Create database
gcloud sql instances create jobapply-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# 3. Connect app to database
gcloud run services update jobapply-pro \
  --add-cloudsql-instances PROJECT_ID:us-central1:jobapply-db \
  --set-env-vars DATABASE_URL="postgresql://..."
```

## Cost Breakdown

### Free Tier (Always Free)
- **Cloud Run**: 
  - 2 million requests/month
  - 180,000 vCPU-seconds
  - 360,000 GiB-seconds
  - 1 GB network egress

### Paid Services (After Free Tier)
- **Cloud Run**: ~$0-5/month (scales to zero)
- **Cloud SQL** (db-f1-micro): ~$10-15/month
- **Network Egress**: ~$0-2/month

**Total: $10-20/month for typical usage**

## Configuration

### Environment Variables

Set these via the Cloud Console or CLI:

```bash
gcloud run services update jobapply-pro \
  --set-env-vars \
  DATABASE_URL="postgresql://user:pass@/db?host=/cloudsql/project:region:instance" \
  SESSION_SECRET="your-session-secret" \
  STRIPE_SECRET_KEY="sk_live_..." \
  VITE_STRIPE_PUBLIC_KEY="pk_live_..." \
  RESEND_API_KEY="re_..." \
  NODE_ENV="production"
```

### Database Connection

Cloud Run connects to Cloud SQL via Unix socket:

```
DATABASE_URL=postgresql://postgres:password@/jobapply_production?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

Example:
```
postgresql://postgres:mypass@/jobapply_production?host=/cloudsql/my-project:us-central1:jobapply-db
```

## Custom Domain Setup

### 1. Map Domain to Cloud Run

```bash
gcloud run domain-mappings create \
  --service jobapply-pro \
  --domain jobapply.pro \
  --region us-central1
```

### 2. Add DNS Records

Add these records to your domain registrar:

```
Type: CNAME
Name: www
Value: ghs.googlehosted.com

Type: A
Name: @
Value: [IP provided by Google Cloud]
```

### 3. SSL Certificate

Google Cloud automatically provisions SSL certificates (free via Let's Encrypt).

## Database Management

### Connect to Database

```bash
# Using Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432

# Then connect with psql
psql "postgresql://postgres:password@localhost:5432/jobapply_production"
```

### Import Database

```bash
# Upload SQL file to Cloud Storage
gsutil cp database_export_20251102_203654.sql gs://your-bucket/

# Import to Cloud SQL
gcloud sql import sql jobapply-db \
  gs://your-bucket/database_export_20251102_203654.sql \
  --database=jobapply_production
```

### Backup Database

```bash
# Export from Cloud SQL
gcloud sql export sql jobapply-db \
  gs://your-bucket/backup_$(date +%Y%m%d).sql \
  --database=jobapply_production
```

## Monitoring & Logging

### View Logs

```bash
# Application logs
gcloud run logs read jobapply-pro \
  --region us-central1 \
  --limit 50

# Database logs
gcloud sql operations list \
  --instance jobapply-db
```

### Set Up Alerts

In Google Cloud Console:
1. Navigation → Monitoring → Alerting
2. Create Policy for:
   - High error rate (>5% errors)
   - High CPU usage (>80%)
   - Database connection errors

## Scaling Configuration

### Auto-Scaling

```bash
gcloud run services update jobapply-pro \
  --min-instances 0 \
  --max-instances 10 \
  --cpu 1 \
  --memory 512Mi
```

**Recommended Settings:**
- **Min instances**: 0 (scale to zero for cost savings)
- **Max instances**: 10 (prevent runaway costs)
- **CPU**: 1 vCPU
- **Memory**: 512Mi (upgrade to 1Gi if needed)

### Database Scaling

```bash
# Upgrade database tier
gcloud sql instances patch jobapply-db \
  --tier=db-g1-small
```

**Available Tiers:**
- `db-f1-micro`: $10/month (0.6 GB RAM)
- `db-g1-small`: $25/month (1.7 GB RAM)
- `db-n1-standard-1`: $50/month (3.75 GB RAM)

## CI/CD Setup (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy jobapply-pro \
            --source . \
            --region us-central1
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check Cloud SQL instance is running
gcloud sql instances describe jobapply-db

# Verify connection string format
echo $DATABASE_URL
```

**2. Environment Variables Not Set**
```bash
# List current env vars
gcloud run services describe jobapply-pro \
  --region us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

**3. Build Failures**
```bash
# View build logs
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

## Cost Optimization Tips

1. **Scale to Zero**: Set `--min-instances 0` to avoid idle charges
2. **Use Smallest DB Tier**: Start with `db-f1-micro`
3. **Enable Connection Pooling**: Reduces database connections
4. **Use Free Tier Regions**: Choose `us-central1`, `us-east1`, or `europe-west1`
5. **Set Budget Alerts**: Get notified if costs exceed $20/month

## Support & Resources

- **Documentation**: https://cloud.google.com/run/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Status Dashboard**: https://status.cloud.google.com
- **Community Support**: https://stackoverflow.com/questions/tagged/google-cloud-run

## Next Steps After Deployment

1. ✅ Update Stripe webhook URL
2. ✅ Configure custom domain
3. ✅ Set up monitoring alerts
4. ✅ Enable daily database backups
5. ✅ Configure CDN (optional for static assets)
6. ✅ Set up staging environment (optional)
