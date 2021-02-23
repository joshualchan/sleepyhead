// this service is actually a authentication AND calendar service

import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

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
  calendarItems: any[];

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
      });
      gapi.client.load('calendar', 'v3', () => console.log('loaded calendar'));
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

  async login(): Promise<firebase.User> {
    console.log('Logging in with Google');
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();
    console.log('Google user:', googleUser);
    const token = googleUser.getAuthResponse().id_token;
    const credential = firebase.auth.GoogleAuthProvider.credential(token);

    const signedInUser = await this.afAuth.signInWithCredential(credential);
    if (signedInUser) {
      from(Storage.set({ key: AUTH_KEY, value: 'true'}));
      // this.isAuthenticated.next(true);
      console.log("auth login user:", signedInUser.user);
      this.getCalendar();
      return signedInUser.user;
    } else {
      console.log('Google Auth failed');
      return Promise.reject();
    }
  }

  // TODO: include logout in mock up as well
  // logout(): Promise<void> {
  //   this.isAuthenticated.next(false);
  //   return Storage.remove({ key: AUTH_KEY});
  //   this.afAuth.signOut();
  // }

  async getCalendar() {
    const events = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime'
    })

    var tomorrow = new Date();
    tomorrow.setDate(new Date().getDate()+1);
    this.calendarItems = events.result.items
    var date = new Date(this.calendarItems[0].start.dateTime) // g: hi! doing merge stuff, do we ever use this?
    this.calendarItems = this.calendarItems.filter(event => new Date(event.start.dateTime) < tomorrow)
  }
}
