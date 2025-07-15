#!/bin/bash

# 🚀 Madani Maktab - Cloud SQL Setup Script
# This script automates the setup of Google Cloud SQL for persistent data storage

set -e  # Exit on any error

echo "🕌 Madani Maktab - Cloud SQL Setup"
echo "=================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ You are not authenticated with Google Cloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project is set. Please set a project:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "✅ Using project: $PROJECT_ID"

# Get region
REGION=$(gcloud config get-value compute/region 2>/dev/null || echo "us-central1")
echo "✅ Using region: $REGION"

# Get service name
echo "Enter your Cloud Run service name:"
read SERVICE_NAME

if [ -z "$SERVICE_NAME" ]; then
    echo "❌ Service name is required"
    exit 1
fi

# Generate passwords
DB_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_USER_PASSWORD=$(openssl rand -base64 32)

echo "🔐 Generated secure passwords:"
echo "   Root password: $DB_ROOT_PASSWORD"
echo "   User password: $DB_USER_PASSWORD"
echo ""
echo "⚠️  Please save these passwords securely!"
echo ""

# Confirm before proceeding
echo "This will create:"
echo "   - MySQL instance: madani-moktob-db"
echo "   - Database: madani_moktob"
echo "   - User: madani_user"
echo "   - Update Cloud Run service: $SERVICE_NAME"
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

echo "🚀 Starting Cloud SQL setup..."

# Step 1: Create MySQL instance
echo "📦 Creating MySQL instance..."
gcloud sql instances create madani-moktob-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password="$DB_ROOT_PASSWORD" \
    --storage-size=10GB \
    --storage-type=SSD \
    --backup-start-time=02:00 \
    --enable-bin-log \
    --authorized-networks=0.0.0.0/0 \
    --quiet

echo "✅ MySQL instance created"

# Step 2: Create database
echo "🗄️ Creating database..."
gcloud sql databases create madani_moktob \
    --instance=madani-moktob-db \
    --quiet

echo "✅ Database created"

# Step 3: Create user
echo "👤 Creating database user..."
gcloud sql users create madani_user \
    --instance=madani-moktob-db \
    --password="$DB_USER_PASSWORD" \
    --quiet

echo "✅ Database user created"

# Step 4: Get connection details
echo "🔍 Getting connection details..."
INSTANCE_IP=$(gcloud sql instances describe madani-moktob-db --format="value(ipAddresses[0].ipAddress)")
CONNECTION_NAME=$(gcloud sql instances describe madani-moktob-db --format="value(connectionName)")

echo "✅ Instance IP: $INSTANCE_IP"
echo "✅ Connection name: $CONNECTION_NAME"

# Step 5: Enable Cloud SQL Admin API
echo "🔧 Enabling Cloud SQL Admin API..."
gcloud services enable sqladmin.googleapis.com --quiet

echo "✅ Cloud SQL Admin API enabled"

# Step 6: Grant permissions
echo "🔐 Granting Cloud SQL Client permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/cloudsql.client" \
    --quiet

echo "✅ Permissions granted"

# Step 7: Update Cloud Run service
echo "🚀 Updating Cloud Run service..."

# Add Cloud SQL instance
gcloud run services update $SERVICE_NAME \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --region=$REGION \
    --quiet

# Set environment variables
gcloud run services update $SERVICE_NAME \
    --set-env-vars="DB_HOST=127.0.0.1" \
    --set-env-vars="DB_USER=madani_user" \
    --set-env-vars="DB_PASSWORD=$DB_USER_PASSWORD" \
    --set-env-vars="DB_NAME=madani_moktob" \
    --set-env-vars="DB_PORT=3306" \
    --region=$REGION \
    --quiet

echo "✅ Cloud Run service updated"

# Step 8: Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "🎉 Setup completed successfully!"
echo "=================================="
echo ""
echo "📋 Summary:"
echo "   MySQL Instance: madani-moktob-db"
echo "   Database: madani_moktob"
echo "   User: madani_user"
echo "   Service URL: $SERVICE_URL"
echo ""
echo "🔐 Passwords (save these securely!):"
echo "   Root password: $DB_ROOT_PASSWORD"
echo "   User password: $DB_USER_PASSWORD"
echo ""
echo "🧪 Testing the setup:"
echo "   Health check: curl $SERVICE_URL/api/health"
echo "   Create sample data: curl -X POST $SERVICE_URL/api/create_sample_data"
echo ""
echo "✅ Your CSV uploads will now persist across deployments and restarts!"
echo ""
echo "💡 Next steps:"
echo "   1. Test the health endpoint"
echo "   2. Upload a CSV file through your web interface"
echo "   3. Hard refresh the page to verify data persistence"
echo "   4. Remove 0.0.0.0/0 from authorized networks for security"
echo ""
echo "📚 For more information, see: CLOUD_SQL_SETUP.md" 