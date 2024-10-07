module.exports = {
  entry: ['src/main.ts', 'src/event.ts', 'serverless.ts'],
  ignore: ['public/js/tailwind.3.4.5.js'],
  ignoreDependencies: [/.*serverless-.*/],
};
