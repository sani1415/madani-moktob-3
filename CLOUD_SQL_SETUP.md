# 🚀 Google Cloud SQL Setup Guide

This guide will help you set up Google Cloud SQL to solve the data persistence issue in your Madani Maktab application.

## 🔍 Problem Solved

**Issue**: Your CSV uploads and data disappear after hard refresh on Google Cloud Run because:
- Cloud Run has an ephemeral (temporary) file system
- SQLite database files get deleted when instances restart
- No persistent storage for your data

**Solution**: Use Google Cloud SQL (MySQL) for persistent, reliable data storage.

## 📋 Prerequisites

1. Google Cloud Project with billing enabled
2. Google Cloud CLI installed and configured
3. Your application already deployed to Google Cloud Run

## 🗄️ Step 1: Create Google Cloud SQL Instance

### Option A: Using Google Cloud Console (Recommended)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to SQL**
   - Go to: SQL in the left sidebar
   - Click "Create Instance"

3. **Choose MySQL**
   - Select "MySQL" as the database engine
   - Click "Next"

4. **Configure Instance**
   - **Instance ID**: `madani-moktob-db` (or your preferred name)
   - **Password**: Create a strong password (save it!)
   - **Database Version**: MySQL 8.0 (recommended)
   - **Region**: Same as your Cloud Run service
   - **Machine Type**: `db-f1-micro` (free tier) or `db-g1-small` (paid)
   - **Storage**: 10 GB (minimum)

5. **Configure Connections**
   - **Public IP**: ✅ Enable
   - **Private IP**: ❌ Disable (for simplicity)
   - **Authorized Networks**: Add `0.0.0.0/0` (temporarily for setup)

6. **Create Database**
   - Click "Create Instance"
   - Wait for creation (5-10 minutes)

### Option B: Using Google Cloud CLI

```bash
# Create MySQL instance
gcloud sql instances create madani-moktob-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=YOUR_STRONG_PASSWORD \
    --storage-size=10GB \
    --storage-type=SSD \
    --backup-start-time=02:00 \
    --enable-bin-log

# Create database
gcloud sql databases create madani_moktob \
    --instance=madani-moktob-db

# Create user
gcloud sql users create madani_user \
    --instance=madani-moktob-db \
    --password=YOUR_USER_PASSWORD
```

## 🔧 Step 2: Configure Cloud SQL Connection

### Get Connection Details

1. **Get Instance Connection Name**
   ```bash
   gcloud sql instances describe madani-moktob-db --format="value(connectionName)"
   ```
   Output: `your-project:us-central1:madani-moktob-db`

2. **Get Public IP Address**
   ```bash
   gcloud sql instances describe madani-moktob-db --format="value(ipAddresses[0].ipAddress)"
   ```

### Configure Cloud Run Service

1. **Set Environment Variables**
   ```bash
   gcloud run services update YOUR_SERVICE_NAME \
     --set-env-vars="DB_HOST=YOUR_PUBLIC_IP" \
     --set-env-vars="DB_USER=madani_user" \
     --set-env-vars="DB_PASSWORD=YOUR_USER_PASSWORD" \
     --set-env-vars="DB_NAME=madani_moktob" \
     --set-env-vars="DB_PORT=3306" \
     --region=us-central1
   ```

2. **Replace with your actual values**:
   - `YOUR_SERVICE_NAME`: Your Cloud Run service name
   - `YOUR_PUBLIC_IP`: The IP address from step 2
   - `YOUR_USER_PASSWORD`: The password you set for the database user

## 🔒 Step 3: Secure the Database

### Option A: Use Cloud SQL Proxy (Recommended for Production)

1. **Enable Cloud SQL Admin API**
   ```bash
   gcloud services enable sqladmin.googleapis.com
   ```

2. **Grant Cloud Run service account access**
   ```bash
   # Get your project number
   PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
   
   # Grant Cloud SQL Client role
   gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/cloudsql.client"
   ```

3. **Update Cloud Run service to use Cloud SQL**
   ```bash
   gcloud run services update YOUR_SERVICE_NAME \
     --add-cloudsql-instances=YOUR_PROJECT:us-central1:madani-moktob-db \
     --region=us-central1
   ```

4. **Update environment variables to use localhost**
   ```bash
   gcloud run services update YOUR_SERVICE_NAME \
     --set-env-vars="DB_HOST=127.0.0.1" \
     --set-env-vars="DB_USER=madani_user" \
     --set-env-vars="DB_PASSWORD=YOUR_USER_PASSWORD" \
     --set-env-vars="DB_NAME=madani_moktob" \
     --set-env-vars="DB_PORT=3306" \
     --region=us-central1
   ```

### Option B: Use Public IP (Quick Setup)

1. **Restrict IP access** (after setup)
   ```bash
   # Get your Cloud Run service IP
   SERVICE_IP=$(gcloud run services describe YOUR_SERVICE_NAME --region=us-central1 --format="value(status.url)")
   
   # Add only your service IP to authorized networks
   gcloud sql instances patch madani-moktob-db \
     --authorized-networks=$SERVICE_IP
   ```

## 🚀 Step 4: Deploy Updated Application

1. **Commit and push your changes**
   ```bash
   git add .
   git commit -m "Add Cloud SQL support for persistent data storage"
   git push origin main
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy YOUR_SERVICE_NAME \
     --source . \
     --region=us-central1 \
     --allow-unauthenticated
   ```

## ✅ Step 5: Test the Setup

1. **Check health endpoint**
   ```bash
   curl https://YOUR_SERVICE_URL/api/health
   ```

2. **Create sample data**
   ```bash
   curl -X POST https://YOUR_SERVICE_URL/api/create_sample_data
   ```

3. **Verify data persistence**
   - Upload CSV file through your web interface
   - Hard refresh the page
   - Data should still be there!

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if database is running
   - Verify IP address and port
   - Check firewall rules

2. **Authentication Failed**
   - Verify username and password
   - Check if user has proper permissions

3. **Database Not Found**
   - Create the database: `madani_moktob`
   - Check database name in environment variables

### Debug Commands

```bash
# Check Cloud Run logs
gcloud logs read --service=YOUR_SERVICE_NAME --limit=50

# Test database connection
gcloud sql connect madani-moktob-db --user=madani_user

# Check environment variables
gcloud run services describe YOUR_SERVICE_NAME --region=us-central1
```

## 💰 Cost Estimation

- **Cloud SQL f1-micro**: ~$7/month (free tier available)
- **Cloud SQL g1-small**: ~$25/month
- **Storage**: ~$0.17/GB/month

**Total**: ~$7-25/month depending on your needs.

## 🎉 Success!

After completing this setup:

✅ **Your CSV uploads will persist** across deployments and restarts  
✅ **All data is securely stored** in Google Cloud SQL  
✅ **Automatic backups** are configured  
✅ **Scalable solution** for growing schools  

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Cloud Run and Cloud SQL logs
3. Verify all environment variables are set correctly
4. Ensure your service account has proper permissions

---

**Note**: This setup provides a production-ready solution. For development, you can still use SQLite locally by not setting the Cloud SQL environment variables. 