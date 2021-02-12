import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(
    private router: Router
  ) {}  
  public todaysBedtime:string = "12:00 am"; //default value
  public tomsWaketime:string = "8:00 am"; //default value

  public text:string = 'Sleep';
  private sleepTime:number; 
  private wakeTime:number;

  // SET BEDTIME/WAKETIME ON SCREEN ======================================
  public setBedtime(Date):void {
    this.todaysBedtime = Date.toLocaleTimeString();
  } 

  public setWaketime(Date):void {
    this.todaysBedtime = Date.toLocaleTimeString();
  } 


  // BUTTON FUNCTIONS ====================================================

  /**updates either sleep or wake time (calls below functions) */
  sleepButton():void {
    this.text=='Sleep' ? this.sleep() : this.wakeUp();
  };

  /** changes sleepTime 
      updates button text */ 
  sleep():void {
    this.sleepTime = Date.now(); 
    this.text = "I'm Awake"; 
    //return [new Date(this.sleepTime), -1];
  };

  /** returns [sleep time as Date object, wake time as a Date object, total sleep time in minutes, rounded to nearest whole number]
     updates button text */ 
  wakeUp():[Date, Date, number] {
    this.wakeTime = Date.now();
    this.text = "Sleep";
    this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true});
    return [new Date(this.sleepTime), new Date(this.wakeTime), Math.floor((this.wakeTime-this.sleepTime)/1000/60)]; 
    // change above line to update db instead of returning the value
  };

}

