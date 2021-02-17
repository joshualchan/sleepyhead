import { Component } from '@angular/core';
import { Data, Router } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) {}

  public groggyColor:string = "secondary"; 
  public sleepyColor:string = "secondary"; 
  public refreshedColor:string = "secondary";
  public mediocreColor:string = "secondary";
  private clickToggle:boolean = false; //true if one feeing already clicked

  private feeling:string = ""; // switch to enum? that might be hard to send to db ? 

   confirmButton() {
    this.groggyColor="secondary";
    this.refreshedColor="secondary";
    this.mediocreColor="secondary";
    if (this.clickToggle) { // if feeling has been clicked
      this.clickToggle = false; 
      this.databaseService.updateFeeling(this.feeling);
      this.authenticationService.user$.subscribe(async (user) => {
        this.databaseService.logToday(user.uid);
        this.router.navigateByUrl('/tabs/tab2', { replaceUrl: true});
      });
    }
  }

  // functions for clicking feelings icons 
  groggy() {
    this.groggyColor="success";
    this.clickToggle = true; 
    this.feeling = "groggy";

    this.refreshedColor="secondary";
    this.mediocreColor="secondary";

  }

  refreshed() {
    this.refreshedColor="success";
    this.clickToggle = true; 
    this.feeling = "refreshed";

    this.groggyColor="secondary";
    this.mediocreColor="secondary";
    
  }

  mediocre() {
    this.mediocreColor="success";
    this.clickToggle = true; 
    this.feeling = "mediocre";

    this.groggyColor="secondary";
    this.refreshedColor="secondary";

  }
}
