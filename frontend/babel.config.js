module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ─── temporarily disable dotenv until later ───
//    ['module:react-native-dotenv', {
//      moduleName: '@env',
//      path: '.env',
//    }],
    ]
  };
};
