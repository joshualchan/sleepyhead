import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { DatabaseService } from '../services/database.service';
import { Tab1Page } from '../tab1/tab1.page';
import { Tab4Page } from '../tab4/tab4.page';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(
    private router: Router,
    private databaseService: DatabaseService,
    private modalController:ModalController
  ) {}

  public todaysBedtime:string = "12:00 am"; //default value
  public tomsWaketime:string = "8:00 am"; //default value

  public text:string = 'Sleep';
  private sleepTime:number; 
  private wakeTime:number;

  // SET BEDTIME/WAKETIME ON SCREEN ======================================
  public setBedtime(Date):void {
    this.todaysBedtime = Date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } 

  public setWaketime(Date):void {
    this.todaysBedtime = Date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  wakeUp() {
    this.wakeTime = Date.now();
    this.text = "Sleep";
    this.databaseService.updateWakeInfo(new Date(this.sleepTime), new Date(this.wakeTime), Math.floor((this.wakeTime-this.sleepTime)/1000/60));
    this.logFeeling();
    //this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true});
  };

  // CALL MODALS 

  /**
   * brings up modal to choose time, passes back chosen time to display on home screen
   */
  async chooseTime() {
    const modal = await this.modalController.create({
      component: Tab4Page
    }); 
    
    modal.onDidDismiss().then((data) => {
      console.log(data); 
      this.setBedtime(data['data']['sleep']); // should be ok bc it is stored as date objects in recommender
      this.setWaketime(data['data']['wake']); 
    }); 
    //  CHECK IF DATA RETURNS SOMETHING - IF USER CLOSES MODAL WITHOUT CHOOSING A TIME, 
    //        THEN JUST IGNORE AND DON'T CHANGE ANYTHING
    return await modal.present(); 
  }

  async logFeeling() {
    const modal = await this.modalController.create({
      component: Tab1Page
    }); 
    return await modal.present(); 
  }

}

