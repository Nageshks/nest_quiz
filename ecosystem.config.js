module.exports = {
    apps: [
      {
        name: 'nest-quiz',
        script: 'dist/src/main.js',
        env: {
          NODE_ENV: 'production',
          PORT: 4555,
        },
      },
    ],  
};