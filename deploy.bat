@echo off

echo 🚀 Starting WhatsApp Bot Deployment...

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
)

REM Add all files
echo 📂 Adding files to Git...
git add .

REM Commit changes
echo 💾 Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update WhatsApp Bot Dashboard
git commit -m "%commit_msg%"

REM Check if remote exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 🔗 Please add your GitHub repository URL:
    set /p repo_url="Enter GitHub repository URL: "
    git remote add origin "%repo_url%"
)

REM Push to GitHub
echo ⬆️ Pushing to GitHub...
git branch -M main
git push -u origin main

echo ✅ Deployment to GitHub complete!
echo 🌐 Your repository is now available on GitHub
echo 📋 Next steps:
echo    1. Go to your GitHub repository
echo    2. Choose a deployment platform (Heroku, Railway, Render, etc.)
echo    3. Connect your repository to the platform
echo    4. Set environment variables
echo    5. Deploy!

pause
