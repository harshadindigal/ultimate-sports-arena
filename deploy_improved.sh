#!/bin/bash
# Improved GitHub deployment script for Ultimate Sports Arena

# Function to display error message and exit
error_exit() {
  echo "ERROR: $1" >&2
  exit 1
}

# Check if GITHUB_TOKEN environment variable exists
if [ -z "$GITHUB_TOKEN" ]; then
  error_exit "GITHUB_TOKEN environment variable not found. Please set it first."
fi

# Get GitHub username
if [ -z "$1" ]; then
  read -p "Enter your GitHub username: " GITHUB_USERNAME
else
  GITHUB_USERNAME="$1"
fi

# Repository name
REPO_NAME="ultimate-sports-arena"

# Configure git
echo "Configuring git..."
git config user.name "Ultimate Sports Arena Deployer" || error_exit "Failed to configure git user name"
git config user.email "deployer@example.com" || error_exit "Failed to configure git user email"

# Initialize git if needed
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init || error_exit "Failed to initialize git repository"
fi

# Add all files
echo "Adding files to git..."
git add . || error_exit "Failed to add files to git"

# Commit changes
echo "Committing changes..."
git commit -m "Deploy Ultimate Sports Arena" || error_exit "Failed to commit changes"

# Set remote origin with correct token format
echo "Setting up GitHub repository connection..."
git remote remove origin 2>/dev/null
git remote add origin "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git" || error_exit "Failed to add remote origin"

# Try to push to main branch first (GitHub default)
echo "Pushing to GitHub main branch..."
if git push -u origin main; then
  echo "Successfully pushed to GitHub repository: ${GITHUB_USERNAME}/${REPO_NAME} (main branch)"
else
  # If main fails, try master branch
  echo "Pushing to GitHub master branch..."
  if git push -u origin master; then
    echo "Successfully pushed to GitHub repository: ${GITHUB_USERNAME}/${REPO_NAME} (master branch)"
  else
    # Create main branch and push if both fail
    echo "Creating main branch and pushing..."
    git checkout -b main || error_exit "Failed to create main branch"
    git push -u origin main || error_exit "Failed to push to GitHub"
    echo "Successfully pushed to GitHub repository: ${GITHUB_USERNAME}/${REPO_NAME} (new main branch)"
  fi
fi

echo "Deployment complete! Repository URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
