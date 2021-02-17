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

    
    this.authenticationService.user$.subscribe(async (user) => {
      this.age = this.databaseService.getAge(user.uid).then(value => {console.log(value);return value;});
      console.log(this.age);
    });
    
    console.log(this.age);
  }

  returnAge() {
    this.authenticationService.user$.subscribe(async (user) => {
      console.log(this.databaseService.getAge(user.uid));
    });

  }

}
