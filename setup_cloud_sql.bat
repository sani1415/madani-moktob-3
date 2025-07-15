@echo off
setlocal enabledelayedexpansion

REM 🚀 Madani Maktab - Cloud SQL Setup Script (Windows)
REM This script automates the setup of Google Cloud SQL for persistent data storage

echo 🕌 Madani Maktab - Cloud SQL Setup
echo ==================================

REM Check if gcloud is installed
where gcloud >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Google Cloud CLI is not installed. Please install it first:
    echo    https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Check if user is authenticated
gcloud auth list --filter=status:ACTIVE --format="value(account)" | findstr /r "." >nul
if %errorlevel% neq 0 (
    echo ❌ You are not authenticated with Google Cloud. Please run:
    echo    gcloud auth login
    pause
    exit /b 1
)

REM Get project ID
for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ No project is set. Please set a project:
    echo    gcloud config set project YOUR_PROJECT_ID
    pause
    exit /b 1
)

echo ✅ Using project: %PROJECT_ID%

REM Get region
for /f "tokens=*" %%i in ('gcloud config get-value compute/region 2^>nul') do set REGION=%%i
if "%REGION%"=="" set REGION=us-central1
echo ✅ Using region: %REGION%

REM Get service name
set /p SERVICE_NAME="Enter your Cloud Run service name: "

if "%SERVICE_NAME%"=="" (
    echo ❌ Service name is required
    pause
    exit /b 1
)

REM Generate passwords (using PowerShell)
for /f "tokens=*" %%i in ('powershell -Command "[System.Web.Security.Membership]::GeneratePassword(32, 10)"') do set DB_ROOT_PASSWORD=%%i
for /f "tokens=*" %%i in ('powershell -Command "[System.Web.Security.Membership]::GeneratePassword(32, 10)"') do set DB_USER_PASSWORD=%%i

echo 🔐 Generated secure passwords:
echo    Root password: %DB_ROOT_PASSWORD%
echo    User password: %DB_USER_PASSWORD%
echo.
echo ⚠️  Please save these passwords securely!
echo.

REM Confirm before proceeding
echo This will create:
echo    - MySQL instance: madani-moktob-db
echo    - Database: madani_moktob
echo    - User: madani_user
echo    - Update Cloud Run service: %SERVICE_NAME%
echo.
set /p CONFIRM="Do you want to continue? (y/N): "

if /i not "%CONFIRM%"=="y" (
    echo ❌ Setup cancelled
    pause
    exit /b 1
)

echo 🚀 Starting Cloud SQL setup...

REM Step 1: Create MySQL instance
echo 📦 Creating MySQL instance...
REM Check if instance already exists
gcloud sql instances describe madani-moktob-db --format="value(name)" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MySQL instance 'madani-moktob-db' already exists. Skipping creation.
) else (
    REM Instance does not exist, so create it
    echo 🚀 Creating new MySQL instance...
    gcloud sql instances create madani-moktob-db ^
        --database-version=MYSQL_8_0 ^
        --tier=db-f1-micro ^
        --region=%REGION% ^
        --root-password="%DB_ROOT_PASSWORD%" ^
        --storage-size=10GB ^
        --storage-type=SSD ^
        --backup-start-time=02:00 ^
        --enable-bin-log ^
        --authorized-networks=0.0.0.0/0 ^
        --quiet
    
    REM Check if creation was successful or if instance already exists
    if %errorlevel% neq 0 (
        REM Try to describe the instance to see if it was actually created
        gcloud sql instances describe madani-moktob-db --format="value(name)" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ MySQL instance exists (may have been created by another process)
        ) else (
            echo ❌ Failed to create MySQL instance
            pause
            exit /b 1
        )
    ) else (
        echo ✅ MySQL instance created successfully
    )
)

REM Step 2: Create database
echo 🗄️ Creating database...
gcloud sql databases create madani_moktob ^
    --instance=madani-moktob-db ^
    --quiet

if %errorlevel% neq 0 (
    echo ⚠️  Database may already exist, continuing...
) else (
    echo ✅ Database created
)

REM Step 3: Create user
echo 👤 Creating database user...
gcloud sql users create madani_user ^
    --instance=madani-moktob-db ^
    --password="%DB_USER_PASSWORD%" ^
    --quiet

if %errorlevel% neq 0 (
    echo ⚠️  User may already exist, updating password...
    gcloud sql users set-password madani_user ^
        --instance=madani-moktob-db ^
        --password="%DB_USER_PASSWORD%" ^
        --quiet
    if %errorlevel% equ 0 (
        echo ✅ User password updated
    ) else (
        echo ❌ Failed to update user password
        pause
        exit /b 1
    )
) else (
    echo ✅ Database user created
)

REM Step 4: Get connection details
echo 🔍 Getting connection details...
for /f "tokens=*" %%i in ('gcloud sql instances describe madani-moktob-db --format="value(ipAddresses[0].ipAddress)"') do set INSTANCE_IP=%%i
for /f "tokens=*" %%i in ('gcloud sql instances describe madani-moktob-db --format="value(connectionName)"') do set CONNECTION_NAME=%%i

echo ✅ Instance IP: %INSTANCE_IP%
echo ✅ Connection name: %CONNECTION_NAME%

REM Step 5: Enable Cloud SQL Admin API
echo 🔧 Enabling Cloud SQL Admin API...
gcloud services enable sqladmin.googleapis.com --quiet

echo ✅ Cloud SQL Admin API enabled

REM Step 6: Grant permissions
echo 🔐 Granting Cloud SQL Client permissions...
for /f "tokens=*" %%i in ('gcloud projects describe %PROJECT_ID% --format="value(projectNumber)"') do set PROJECT_NUMBER=%%i

gcloud projects add-iam-policy-binding %PROJECT_ID% ^
    --member="serviceAccount:%PROJECT_NUMBER%-compute@developer.gserviceaccount.com" ^
    --role="roles/cloudsql.client" ^
    --quiet

echo ✅ Permissions granted

REM Step 7: Update Cloud Run service
echo 🚀 Updating Cloud Run service...

REM Add Cloud SQL instance
gcloud run services update %SERVICE_NAME% ^
    --add-cloudsql-instances=%CONNECTION_NAME% ^
    --region=%REGION% ^
    --quiet

REM Set environment variables
gcloud run services update %SERVICE_NAME% ^
    --set-env-vars="DB_HOST=127.0.0.1" ^
    --set-env-vars="DB_USER=madani_user" ^
    --set-env-vars="DB_PASSWORD=%DB_USER_PASSWORD%" ^
    --set-env-vars="DB_NAME=madani_moktob" ^
    --set-env-vars="DB_PORT=3306" ^
    --region=%REGION% ^
    --quiet

echo ✅ Cloud Run service updated

REM Step 8: Get service URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)"') do set SERVICE_URL=%%i

echo.
echo 🎉 Setup completed successfully!
echo ==================================
echo.
echo 📋 Summary:
echo    MySQL Instance: madani-moktob-db
echo    Database: madani_moktob
echo    User: madani_user
echo    Service URL: %SERVICE_URL%
echo.
echo 🔐 Passwords (save these securely!):
echo    Root password: %DB_ROOT_PASSWORD%
echo    User password: %DB_USER_PASSWORD%
echo.
echo 🧪 Testing the setup:
echo    Health check: curl %SERVICE_URL%/api/health
echo    Create sample data: curl -X POST %SERVICE_URL%/api/create_sample_data
echo.
echo ✅ Your CSV uploads will now persist across deployments and restarts!
echo.
echo 💡 Next steps:
echo    1. Test the health endpoint
echo    2. Upload a CSV file through your web interface
echo    3. Hard refresh the page to verify data persistence
echo    4. Remove 0.0.0.0/0 from authorized networks for security
echo.
echo 📚 For more information, see: CLOUD_SQL_SETUP.md
pause