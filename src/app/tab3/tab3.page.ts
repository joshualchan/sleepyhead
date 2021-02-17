import { Component } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

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
    //this.databaseService.getAge("UEZuYf4qFXUrybJhFZxnDAhjZyB2").then(data => console.log(data));
    //this.age = 0;
    //this.goal = 0;
    this.authenticationService.user$.subscribe((currentUser) => {
      var t = this.databaseService.getUser(currentUser.uid).then(value => {
        this.age = value.age;
        this.goal = value.goal;
      })
    });

  }
  
  returnAge() {
    console.log(this.age);
    return this.age;
  }
  returnGoal() {
    return this.goal;
  }

}
