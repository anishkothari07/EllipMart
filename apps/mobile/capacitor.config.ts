import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ellipmart.app',
  appName: 'EllipMart',
  webDir: 'public',
  server: {
    url: 'https://ellipmart-two.vercel.app',
    cleartext: false,
    allowNavigation: [
      'ellipmart-two.vercel.app',
      '*.vercel.app',
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
