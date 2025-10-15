export default () => ({
  auth: {
    admin: {
      jwtSecret: process.env.ADMIN_JWT_SECRET || 'defaultSecret',
      jwtExpirationTime: process.env.ADMIN_JWT_EXPIRES_IN || '1h',
      refreshTokenSecret:
        process.env.ADMIN_REFRESH_TOKEN_SECRET || 'defaultRefreshSecret',
      refreshTokenExpirationTime:
        process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN || '7d',
    },
    user: {
      jwtSecret: process.env.USER_JWT_SECRET || 'defaultSecret',
      jwtExpirationTime: process.env.USER_JWT_EXPIRES_IN || '1h',
      refreshTokenSecret:
        process.env.USER_REFRESH_TOKEN_SECRET || 'defaultRefreshSecret',
      refreshTokenExpirationTime:
        process.env.USER_REFRESH_TOKEN_EXPIRES_IN || '7d',
    },

    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
      appSecret: process.env.FACEBOOK_APP_SECRET || 'YOUR_FACEBOOK_APP_SECRET',
    },
  },
});
