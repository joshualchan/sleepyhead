import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';

// capacitor is ionic's way to interact with the native system
import { Plugins } from '@capacitor/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

declare var gapi: any;

const { Storage } = Plugins; // local storage to store auth status
const AUTH_KEY = 'false';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user$: Observable<firebase.User>;

  constructor(public afAuth: AngularFireAuth) {
    this.initClient();
    this.user$ = afAuth.authState;
    // this.loadAuthStatus();
  }

  // Initialize the Google API client with desired scopes
  initClient() {
    gapi.load('client', () => {
      console.log('loaded Google API client');

      // It's OK to expose these credentials, they are client safe.
      gapi.client.init({
        apiKey: 'AIzaSyA3tFJiPaQO_yevCtglcH6C7La2d876x0o',
        clientId: '860267389565-fppo7d5kf6jeb83gigabcsekoj0ou5is.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly'
      })
    });
  }

  // used for auto login
  // async loadAuthStatus() {
  //   const authStatus = await Storage.get({ key: AUTH_KEY});
  //   if (authStatus && authStatus.value) {
  //     this.isAuthenticated.next(true);
  //   } else {
  //     this.isAuthenticated.next(false);
  //   }
  // }

  async login() {
    console.log('Logging in with Google');
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();
    console.log('Google user:', googleUser);
    const token = googleUser.getAuthResponse().id_token;
    const credential = firebase.auth.GoogleAuthProvider.credential(token);

    await this.afAuth.signInWithCredential(credential).then(() => {
      from(Storage.set({ key: AUTH_KEY, value: 'true'}));
      // this.isAuthenticated.next(true);
      return true;
    }).catch((error) => {
      console.log('Google Auth failed:', error);
      return false;
    });
  }

  // TODO: include logout in mock up
  // logout(): Promise<void> {
  //   this.isAuthenticated.next(false);
  //   return Storage.remove({ key: AUTH_KEY});
  //   this.afAuth.signOut();
  // }
}
