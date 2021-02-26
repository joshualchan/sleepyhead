import { Component } from '@angular/core';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

export class Tab3Page {

  constructor(
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) {
    this.authenticationService.user$.subscribe((currentUser) => {
      if (currentUser && currentUser.uid) {
        this.authenticationService.getCalendar();
      }
    });
  }
  
  doRefresh(event) {
    console.log('Begin async operation');
    this.authenticationService.getCalendar();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  translateDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
  }

}
