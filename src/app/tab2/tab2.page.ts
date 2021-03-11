import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController} from '@ionic/angular';

import { DatabaseService } from '../services/database.service';
import { RecommenderService } from '../services/recommender.service';
import { Tab1Page } from '../tab1/tab1.page';
import { Tab4Page } from '../tab4/tab4.page';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public todaysBedtime:Date
  public tomsWaketime:Date
  private category:string = "";

  public text:string = 'Sleep';
  private sleepTime:number; 
  private wakeTime:number;

  constructor(
    private router: Router,
    private recommenderService: RecommenderService,
    private databaseService: DatabaseService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
  }

  
  async ionViewDidEnter() {
    const loading = await this.loadingController.create();
    await loading.present();

    const max = await this.recommenderService.getMaxTimes();
    this.setBedtime(max[0]['sleep']); 
    this.setWaketime(max[0]['wake']);
    this.category='max';

    loading.dismiss();
  }


  // SET BEDTIME/WAKETIME ON SCREEN ======================================
  public setBedtime(date:Date) {
    this.todaysBedtime = date; 
  } 

  public setWaketime(date:Date) {
    this.tomsWaketime = date; 
  } 

  dateToString(date:Date):String {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  };

  /** returns [sleep time as Date object, wake time as a Date object, total sleep time in minutes, rounded to nearest whole number]
      updates button text */ 
  wakeUp() {
    this.wakeTime = Date.now();
    this.text = "Sleep";
    this.databaseService.updateWakeInfo(new Date(this.sleepTime), new Date(this.wakeTime), Math.floor((this.wakeTime-this.sleepTime)/1000/60));
    this.logFeeling();
  };

  // CALL MODALS 

  /**
   * brings up modal to choose time, passes back chosen time to display on home screen
   */
  async chooseTime() {
    const loading = await this.loadingController.create();
    await loading.present();

    const max = await this.recommenderService.getMaxTimes();
    const cons = await this.recommenderService.getConsistentTimes();
    const over = await this.recommenderService.getOverallTimes();
    
    const modal = await this.modalController.create({
      component: Tab4Page, 
      componentProps: {
        'displayedTime': {'sleep': this.todaysBedtime, 'wake': this.tomsWaketime, 'category': this.category},
        'maxTimes': max,
        'consistentTimes': cons,
        'overallTimes': over
      }
    }); 
    
    modal.onDidDismiss().then((data) => {
      console.log(data); 
      this.setBedtime(data['data']['chosenTime']['sleep']); // should be ok bc it is stored as date objects in recommender
      this.setWaketime(data['data']['chosenTime']['wake']); 
      this.category = data['data']['category'];
    }).catch(() => console.log("no changed times selected"));

    await loading.dismiss();
    return await modal.present(); 
  }

  async logFeeling() {
    const modal = await this.modalController.create({
      component: Tab1Page
    }); 
    return await modal.present(); 
  }

}

