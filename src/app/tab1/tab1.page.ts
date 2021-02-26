import { Component } from '@angular/core';
import { Data, Router } from '@angular/router';

import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(
    private router: Router,
    private databaseService: DatabaseService
  ) {}

  public sleepyColor:string = "light"; 
  public refreshedColor:string = "light";
  public mediocreColor:string = "light";
  private clickToggle:boolean = false; //true if one feeing already clicked

  private feeling:string = ""; // switch to enum? that might be hard to send to db ? 

   confirmButton() {
    this.sleepyColor="light";
    this.refreshedColor="light";
    this.mediocreColor="light";
    if (this.clickToggle) { // if feeling has been clicked
      this.clickToggle = false; 
      this.databaseService.updateFeeling(this.feeling);
      this.databaseService.logToday();
      this.router.navigateByUrl('/tabs/tab2', { replaceUrl: true});
    }
  }

  // functions for clicking feelings icons 
  sleepy() {
    this.sleepyColor="success";
    this.clickToggle = true; 
    this.feeling = "sleepy";

    this.refreshedColor="light";
    this.mediocreColor="light";
  }

  refreshed() {
    this.refreshedColor="success";
    this.clickToggle = true; 
    this.feeling = "refreshed";

    this.sleepyColor="light";
    this.mediocreColor="light";
  }

  mediocre() {
    this.mediocreColor="success";
    this.clickToggle = true; 
    this.feeling = "mediocre";

    this.sleepyColor="light";
    this.refreshedColor="light";
  }
}
