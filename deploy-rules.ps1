# PoultryPro — Deploy Firestore Security Rules
# Run this script after logging into Firebase CLI

Write-Host ""
Write-Host "=== PoultryPro Firestore Rules Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if logged in
Write-Host "[1/3] Checking Firebase authentication..." -ForegroundColor Yellow
$loginCheck = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Opening browser for Firebase login..." -ForegroundColor Red
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Authenticated successfully!" -ForegroundColor Green

# Step 2: Set the project
Write-Host ""
Write-Host "[2/3] Setting active project to 'smartpoultryai'..." -ForegroundColor Yellow
firebase use smartpoultryai
if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not set project. Please check the project ID." -ForegroundColor Red
    exit 1
}
Write-Host "Project set!" -ForegroundColor Green

# Step 3: Deploy rules
Write-Host ""
Write-Host "[3/3] Deploying Firestore security rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== SUCCESS ===" -ForegroundColor Green
Write-Host "Firestore rules deployed! Your PoultryPro dashboard should now connect without permission errors." -ForegroundColor Green
Write-Host "Refresh your browser to see the changes take effect." -ForegroundColor Cyan
Write-Host ""
