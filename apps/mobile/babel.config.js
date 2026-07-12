module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: '../../packages/design-system/dist/tamagui.config.js',
          logTimings: true,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
