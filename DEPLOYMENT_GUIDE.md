# Ultimate Sports Arena - Deployment Guide

## GitHub Deployment

The GITHUB_TOKEN provided is in a special encrypted format (Fernet encryption) that cannot be used directly with GitHub's authentication methods. To deploy this project to GitHub:

1. Generate a standard GitHub Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate a new token with 'repo' scope

2. Use the token to push the repository:
   ```bash
   git remote set-url origin https://USERNAME:TOKEN@github.com/harshadindigal/ultimate-sports-arena.git
   git push -u origin main
   ```

3. Alternative: Manual Repository Creation:
   - Create the repository manually at https://github.com/harshadindigal/ultimate-sports-arena
   - Upload the key files through the GitHub web interface

## Full Deployment Steps

1. **Database Setup**: Create a MongoDB Atlas cluster for production data
2. **Frontend Deployment**: Deploy the React frontend to Netlify
3. **Backend Deployment**: Deploy the Express backend to Render or Fly.io
4. **Environment Configuration**: Set up environment variables for production
