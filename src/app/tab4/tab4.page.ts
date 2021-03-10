import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { RecommenderService } from '../services/recommender.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  chosenTime; 
  times = {
    'max': [{'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
            {'sleep':'12:01am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
            {'sleep':'12:02am', 'wake': '8:00am', 'chosen':false, 'color':'dark'}],
    'consistent': [{'sleep':'12:03am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                  {'sleep':'12:04am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                  {'sleep':'12:05am', 'wake': '8:00am', 'chosen':false, 'color':'dark'}],
    'overall': [{'sleep':'12:06am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                {'sleep':'12:07am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                {'sleep':'12:08am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                {'sleep':'12:09am', 'wake': '8:00am', 'chosen':false, 'color':'dark'}]
  }

  constructor(private recommenderService: RecommenderService, private modalController:ModalController) { }

  ngOnInit() {
    this.recommenderService.getMaxTimes(); 
    this.recommenderService.getConsistentTimes(); 
    this.recommenderService.getOverallTimes(); 
    this.times = this.recommenderService.times;
    console.log(this.times);  
  }

  getMaxTimes() {
    this.recommenderService.getMaxTimes();
  }

  getConsistentTimes() {
    this.recommenderService.getConsistentTimes();
  }

  getOverallTimes() {
    this.recommenderService.getOverallTimes();
  }

  chooseTime(index:number, category:string) {
    console.log("clicked");

    Object.keys(this.times).forEach( (category) => {
      this.times[category].forEach( (option) => {
        option.chosen = false; 
        option.color = "dark"; 
      });
    });

    this.chosenTime = this.times[category][index]; 
    this.times[category][index].chosen = true; 
    this.times[category][index].color = "success";
    
  }

  dismiss() {
    // pass back chosen value, if user has one chosen
    //console.log(this.chosenTime); 
    this.modalController.dismiss({
      'dismissed': true,
      'chosenTime': this.chosenTime
    });
  }

}
