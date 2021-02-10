import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor() {}  
  public text:string = 'Sleep';
  private sleepTime:number; 
  private wakeTime:number;


  // returns either sleep or wake time, and total minutes slept(only on wake up click, -1 on sleep click)
  sleepButton():[Date, number] {
   // let returnVal = this.text=='Sleep' ? this.sleep() : this.wakeUp(); 
    // console.log(returnVal); 
    return this.text=='Sleep' ? this.sleep() : this.wakeUp();
  };

  // returns [sleep time as a Date object, -1]
  // updates button text
  sleep():[Date, number] {
    this.sleepTime = Date.now(); 
    this.text = "I'm Awake"; 
    return [new Date(this.sleepTime), -1];
  };

  // retunrs [wake time as a Date object, total sleep time in minutes, rounded to nearest whole number]
  // updates button text 
  wakeUp():[Date, number] {
    this.wakeTime = Date.now();
    this.text = "Sleep";
    return [new Date(this.wakeTime), Math.floor((this.wakeTime-this.sleepTime)/1000/60)]; 
  };

}

