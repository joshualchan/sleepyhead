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
  constructor(
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) {
    //this.databaseService.getAge("UEZuYf4qFXUrybJhFZxnDAhjZyB2").then(data => console.log(data));

    this.age =0;
    this.authenticationService.user$.subscribe(async (user) => {
      this.databaseService.getUser(user.uid).then(value => {
        console.log(value.age);
        this.age = value.age;
      });
    });
    
    console.log(this.age);
  }
  /*
  returnAge() {
    this.authenticationService.user$.subscribe(async (user) => {
      console.log(this.databaseService.getUser(user.uid).age);
    });

  }*/

}
