# BrainDevils - Deployment Guide

## Vercel Deployment

This project is configured for easy deployment on Vercel with both frontend and backend.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Google OAuth**: Configure OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)

### Environment Variables

Set these environment variables in your Vercel dashboard:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/braindevils

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client URL (your Vercel domain)
CLIENT_URL=https://your-app-name.vercel.app
```

### Deployment Steps

1. **Fork/Clone Repository**
   ```bash
   git clone <repository-url>
   cd braindevils-games
   ```

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all the required environment variables listed above

5. **Update Google OAuth Settings**
   - Go to Google Cloud Console
   - Navigate to APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add your Vercel domain to Authorized origins:
     - `https://your-app-name.vercel.app`

6. **Update Client ID in Code**
   - Edit `public/js/app.js`
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID

### MongoDB Atlas Setup

1. **Create Cluster**
   - Sign up for MongoDB Atlas
   - Create a free M0 cluster
   - Choose a cloud provider and region

2. **Configure Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Or add Vercel's IP ranges for better security

3. **Create Database User**
   - Go to Database Access
   - Add a new database user
   - Choose password authentication
   - Give read/write access to any database

4. **Get Connection String**
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Google OAuth Setup

1. **Create Project**
   - Go to Google Cloud Console
   - Create a new project or select existing

2. **Enable Google+ API**
   - Go to APIs & Services > Library
   - Search for "Google+ API"
   - Enable it

3. **Create OAuth Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:3001` (for development)
     - `https://your-app-name.vercel.app` (for production)

4. **Configure Consent Screen**
   - Go to OAuth consent screen
   - Fill in required information
   - Add your domain to authorized domains

### Post-Deployment

1. **Test Authentication**
   - Visit your deployed app
   - Try signing in with Google
   - Verify user data is saved to MongoDB

2. **Test Games**
   - Play each game to ensure functionality
   - Verify progress tracking works
   - Check leaderboards

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor MongoDB Atlas metrics
   - Review error logs

### Troubleshooting

**Common Issues:**

1. **Google OAuth Error**
   - Verify client ID is correct in code
   - Check authorized origins in Google Console
   - Ensure domain matches exactly

2. **Database Connection Error**
   - Verify MongoDB connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Environment Variables**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure values don't have extra spaces

4. **Build Errors**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Review build logs in Vercel dashboard

### Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to your project settings
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update OAuth Settings**
   - Add custom domain to Google OAuth authorized origins
   - Update CLIENT_URL environment variable

### Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique JWT secrets
   - Rotate secrets periodically

2. **CORS Configuration**
   - Limit CORS origins to your domains only
   - Don't use wildcards in production

3. **Rate Limiting**
   - Monitor API usage
   - Adjust rate limits as needed
   - Implement additional security measures if needed

### Support

For deployment issues:
1. Check Vercel documentation
2. Review MongoDB Atlas guides
3. Consult Google OAuth documentation
4. Check project issues on GitHub

---

**Made with ♥ by Shashwat Raj**