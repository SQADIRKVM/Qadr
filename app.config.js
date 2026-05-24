const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const expo = { ...appJson.expo };
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';

  return {
    ...expo,
    android: {
      ...expo.android,
      googleServicesFile,
    },
  };
};
