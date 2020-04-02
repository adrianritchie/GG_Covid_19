// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  colours: {
    'Positive results': 'rgb(214, 39, 40)',
    'Awaiting results': 'rgb(255, 127, 14)',
    'Negative results': 'rgb(44, 160, 44)',
    'Number of samples tested': 'rgb(31, 119, 180)',
    'Number of deaths': 'rgb(0, 0, 0)',
    'Awaiting Testing': '#605ca8'
  },

  firebase: {
    apiKey: 'AIzaSyBZOD-6sj0bsGCr2TWfYdU2E26Y6viHyt0',
    authDomain: 'gg-covid-19.firebaseapp.com',
    databaseURL: 'https://gg-covid-19.firebaseio.com',
    projectId: 'gg-covid-19',
    storageBucket: 'gg-covid-19.appspot.com',
    messagingSenderId: '294086359309',
    appId: '1:294086359309:web:d07642149b9528ef2d5844',
    measurementId: 'G-7B0MNHY5HB'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
