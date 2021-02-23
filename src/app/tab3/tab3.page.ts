import { Component } from '@angular/core';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

export class Tab3Page {
  age;
  goal;

  constructor(
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) {
    this.authenticationService.user$.subscribe((currentUser) => {
      this.databaseService.getUser(currentUser.uid).then(value => {
        this.age = value.age;
        this.goal = value.goal;
      });
      this.authenticationService.getCalendar();
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

  returnAge() {
    return this.age;
  }

  returnGoal() {
    return this.goal;
  }

  translateDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
  }

}
