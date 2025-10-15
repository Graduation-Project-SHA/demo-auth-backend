export default () => ({
  app: {
    name: process.env.APP_NAME || 'Nest App',
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },
});
