import { ThisReceiver } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  @Input() maxTimes: []
  @Input() consistentTimes: []
  @Input() overallTimes: [] 

  chosenTime; 
  times = {
    'max': [],
    'consistent': [],
    'overall': []
  }

  constructor(private modalController:ModalController) { }

  ngOnInit() {
    this.times['max'] = this.maxTimes; 
    this.times['consistent'] = this.consistentTimes; 
    this.times['overall'] = this.overallTimes; 
  }

  printDateString(date:Date):String {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  printHoursString(hours:number) {
    var sleepHours = Math.floor(hours);
    hours -= Math.floor(hours);
    var sleepMins = Math.round(60 * hours);
    return sleepHours + " hours, " + sleepMins + " minutes"
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
    this.modalController.dismiss({
      'dismissed': true,
      'chosenTime': this.chosenTime
    });
  }

}
