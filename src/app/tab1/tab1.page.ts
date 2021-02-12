import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor() {}

  public groggyColor:string = "secondary"; 
  public sleepyColor:string = "secondary"; 
  public refreshedColor:string = "secondary";
  public mediocreColor:string = "secondary";
  private clickToggle:boolean = false; //true if one feeing already clicked

  private feeling:string = ""; // switch to enum? that might be hard to send to db ? 
  

   confirmButton() {
    this.groggyColor="secondary";
    this.sleepyColor="secondary";
    this.refreshedColor="secondary";
    this.mediocreColor="secondary";
    if (this.clickToggle) { // if feeling has been clicked
      // add nav stuff


      return this.feeling; // switch to add feeling to db 
    }
  }

  // functions for clicking feelings icons 
  groggy() {
    if (!this.clickToggle){
       this.groggyColor="success";
       this.clickToggle = true; 
       this.feeling = "groggy";
    }
  }

  sleepy() {
    if (!this.clickToggle){
      this.sleepyColor="success";
      this.clickToggle = true; 
      this.feeling = "sleepy";
   }
  }

  refreshed() {
    if (!this.clickToggle){
      this.refreshedColor="success";
      this.clickToggle = true; 
      this.feeling = "refreshed";
   }
  }

  mediocre() {
    if (!this.clickToggle){
      this.mediocreColor="success";
      this.clickToggle = true; 
      this.feeling = "mediocre";
   }
  }
 }
