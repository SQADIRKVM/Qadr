module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Required for web: some deps (e.g. Skia/victory-native) use import.meta
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
