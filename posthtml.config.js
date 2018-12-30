module.exports = {
  plugins: {
    "posthtml-expressions": {
      locals: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  }
};
