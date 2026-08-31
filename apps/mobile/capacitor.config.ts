import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ellipmart.app',
  appName: 'EllipMart',
  webDir: 'public',
  server: {
    url: 'http://192.168.68.59:3001',
    cleartext: true,
    allowNavigation: [
      '192.168.68.59',
      'ellipmart.com',
      'api.razorpay.com',
      'checkout.razorpay.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#09090b',
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#fbfbf9',
      overlaysWebView: false,
    },
  },
};

export default config;
