module.exports = {
  apps: [
    {
      name: 'strapi',
      cwd: './strapi',      // Go into the project folder
      script: 'cmd.exe',    // Run the Windows Command Prompt
      args: '/c yarn develop', // Tell Command Prompt to run "yarn develop"
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};yarn --cwd next dev