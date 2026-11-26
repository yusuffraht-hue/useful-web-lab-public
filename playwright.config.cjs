const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir:'./tests',
  testMatch:'**/*.spec.cjs',
  timeout:30000,
  webServer: process.env.PREVIEW_URL ? undefined : {
    command:'python3 -m http.server 8117 --bind 127.0.0.1 --directory dist/site',
    url:'http://127.0.0.1:8117',
    reuseExistingServer:false
  },
  projects:[
    {name:'Chromium',use:{...devices['Desktop Chrome']}},
    {name:'iPhone-size WebKit',use:{...devices['iPhone 13']}}
  ]
});
