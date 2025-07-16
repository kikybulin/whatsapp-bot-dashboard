#!/bin/bash

# WhatsApp Bot Deployment Script

echo "🚀 Starting WhatsApp Bot Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Add all files
echo "📂 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update WhatsApp Bot Dashboard"
fi
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote get-url origin &>/dev/null; then
    echo "🔗 Please add your GitHub repository URL:"
    read -p "Enter GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
fi

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Deployment to GitHub complete!"
echo "🌐 Your repository is now available on GitHub"
echo "📋 Next steps:"
echo "   1. Go to your GitHub repository"
echo "   2. Choose a deployment platform (Heroku, Railway, Render, etc.)"
echo "   3. Connect your repository to the platform"
echo "   4. Set environment variables"
echo "   5. Deploy!"
