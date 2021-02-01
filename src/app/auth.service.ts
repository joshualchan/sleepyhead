import { Component,Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

declare var gapi: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  user$: Observable<firebase.User>; 
  calendarItems: any[];

  constructor(public afAuth: AngularFireAuth) { 
    this.initClient();
    this.user$ = afAuth.authState;
  }

  // Initialize the Google API client with desired scopes
  initClient() {
    gapi.load('client', () => {
      console.log('loaded client')

      // It's OK to expose these credentials, they are client safe.
      gapi.client.init({
        apiKey: 'AIzaSyA3tFJiPaQO_yevCtglcH6C7La2d876x0o',
        clientId: '860267389565-fppo7d5kf6jeb83gigabcsekoj0ou5is.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly'
      })

      gapi.client.load('calendar', 'v3', () => console.log('loaded calendar'));

    });
  }

  

  async login() {
    const googleAuth = gapi.auth2.getAuthInstance()
    const googleUser = await googleAuth.signIn();

    const token = googleUser.getAuthResponse().id_token;

    console.log(googleUser)

    const credential = auth.GoogleAuthProvider.credential(token);

    await this.afAuth.auth.signInWithCredential(credential);


    // Alternative approach, use the Firebase login with scopes and make RESTful API calls

    // const provider = new auth.GoogleAuthProvider()
    // provider.addScope('https://www.googleapis.com/auth/calendar');

    // this.afAuth.auth.signInWithPopup(provider)
    
  }
  logout() {
    this.afAuth.auth.signOut();
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
    var date = new Date(this.calendarItems[0].start.dateTime)
    this.calendarItems = this.calendarItems.filter(event => new Date(event.start.dateTime) < tomorrow)

  }



}

//const hoursFromNow = (n) => new Date(Date.now() + n * 1000 * 60 * 60 ).toISOString();
