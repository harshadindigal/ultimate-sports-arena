#!/bin/bash
# This script helps deploy the Ultimate Sports Arena application

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set it with: export GITHUB_TOKEN=your_token_here"
    exit 1
fi

# Configure git
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set the remote URL with the token
git remote set-url origin https://oauth2:${GITHUB_TOKEN}@github.com/yourusername/ultimate-sports-arena.git

# Add all files
git add .

# Commit changes
git commit -m "Deployment commit"

# Push to GitHub
git push -u origin main

echo "Successfully pushed to GitHub!"
