import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';

// capacitor is ionic's way to interact with the native system
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins; // local storage to store auth status
const AUTH_KEY = 'false';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadAuthStatus();
  }

  async loadAuthStatus() {
    const authStatus = await Storage.get({ key: AUTH_KEY});
    if (authStatus && authStatus.value) {
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  login() {
    // filler logic to test login navigation
    from(Storage.set({ key: AUTH_KEY, value: 'true'}));
    this.isAuthenticated.next(true);
    return true;
  }

  // TODO: include logout in mock up
  // logout(): Promise<void> {
  //   this.isAuthenticated.next(false);
  //   return Storage.remove({ key: AUTH_KEY});
  // }
}
