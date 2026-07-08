import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.psihumanis.app',
  appName: 'PsiHumanis',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://psihumanis.com.br',
    cleartext: false,
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#0D9488',
      showSpinner: true,
      spinnerColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#0D9488',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DEFAULT',
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0D9488',
  },
};

export default config;
