module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-worklets/plugin',
      // ─── temporarily disable dotenv until later ───
//    ['module:react-native-dotenv', {
//      moduleName: '@env',
//      path: '.env',
//    }],
    ]
  };
};
