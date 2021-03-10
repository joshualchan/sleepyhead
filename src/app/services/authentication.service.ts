// this service is actually a authentication AND calendar service

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user$: Observable<firebase.User>;
  calendarItems: any[];

  constructor(public afAuth: AngularFireAuth) {
    this.initClient();
    this.user$ = afAuth.authState;
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

  async login(): Promise<firebase.User> {
    console.log('Logging in with Google');
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();
    console.log('Google user:', googleUser);
    const token = googleUser.getAuthResponse().id_token;
    const credential = firebase.auth.GoogleAuthProvider.credential(token);

    const signedInUser = await this.afAuth.signInWithCredential(credential);
    if (signedInUser) {
      console.log("auth login user:", signedInUser.user);
      this.getCalendar();
      return signedInUser.user;
    } else {
      console.log('Google Auth failed');
      return Promise.reject();
    }
  }

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
    this.calendarItems = this.calendarItems.filter(event => new Date(event.start.dateTime) < tomorrow)
  }

  logout() {
    this.afAuth.signOut();
  }
}
