import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ellipmart.app',
  appName: 'EllipMart',
  webDir: 'public',
  server: {
    url: 'https://ellipmart-two.vercel.app',
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'ellipmart-two.vercel.app',
      '*.vercel.app',
      'ellipmart.com',
      'api.razorpay.com',
      'checkout.razorpay.com',
      '*.supabase.co',
      'res.cloudinary.com',
    ],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#09090b',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#09090b',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#09090b',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
