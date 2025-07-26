module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          sourceDir: '../node_modules/react-native-vector-icons/Fonts',
          project: 'LexiLoop.xcodeproj',
        },
      },
    },
  },
  assets: ['./src/assets/fonts/'],
};