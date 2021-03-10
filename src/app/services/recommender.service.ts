import { Injectable } from '@angular/core';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';


@Injectable({
  providedIn: 'root'
})
export class RecommenderService {
  ageGroup: string;
  goal: number; 
  wakeGoal;
  todaysWakeGoal;
  recentDays;
  firstEvent: Date;
  // Sleep Foundation sleep hour recommendations
  recommended = {
    'preschooler':{'low':10, 'high':13}, 
    'child':{'low':9, 'high':11}, 
    'teenager':{'low':8, 'high':10},
    'youngAdult':{'low':7, 'high':9},
    'adult':{'low':7, 'high':9},
    'senior':{'low':7, 'high':8}
  };
  
  times = {
    'max':[], 
    'consistent':[],
    'overall':[]
  }
  

  constructor(
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) {
    this.authenticationService.user$.subscribe((currentUser) => {
      if (currentUser && currentUser.uid) {
        this.databaseService.getUser().then( () => {
          this.ageGroup = this.databaseService.userDoc.ageGroup;
          this.goal = this.databaseService.userDoc.goal;
          this.wakeGoal = this.databaseService.userDoc.wakeGoal.toDate();
          console.log("db info receied: ", this.wakeGoal);
          this.todaysWakeGoal = new Date();
          if (this.todaysWakeGoal.getHours() >= 12) { // set to tomorrow if PM
            this.todaysWakeGoal.setDate(this.todaysWakeGoal.getDate() + 1);
          }
          console.log(this.todaysWakeGoal); 
          console.log(this.wakeGoal); 
          this.todaysWakeGoal.setHours(this.wakeGoal.getHours());
          this.todaysWakeGoal.setMinutes(this.wakeGoal.getMinutes());
          console.log(this.todaysWakeGoal); 

          this.authenticationService.getCalendar().then(() => {
            if (this.authenticationService.calendarItems.length > 0) {
              this.firstEvent = new Date(this.authenticationService.calendarItems[0].start.dateTime);
              this.firstEvent.setHours(this.firstEvent.getHours() - 1);
              console.log(this.firstEvent); 
            } else {
              this.firstEvent = new Date();
              this.firstEvent.setHours(23, 0, 0, 0);
            }
          });
        }).catch( () => console.log("userDoc not set in db service") );
      }
    });
  }

  onInit() {
    this.authenticationService.user$.subscribe((currentUser) => {
      if (currentUser && currentUser.uid) {
          this.authenticationService.getCalendar().then(() => {
            if (this.authenticationService.calendarItems.length > 0) {
              this.firstEvent = new Date(this.authenticationService.calendarItems[0].start.dateTime);
              this.firstEvent.setHours(this.firstEvent.getHours() - 1);
            } else {
              this.firstEvent = new Date();
              this.firstEvent.setHours(23, 0, 0, 0);
            }
          });
      }
    });
  }

  /* returns array: [sleepHours, sleepMins]
     input: 9.25hrs output: [9, 15]
  */
  getDecToTime(hours: number) {
    var sleepHours = Math.floor(hours);
    hours -= Math.floor(hours);
    var sleepMins = 60 * hours;
    return [sleepHours, sleepMins];
  }

  getHoursSlept(sleepTime:Date, wakeTime:Date): number {
    const sleep = sleepTime.getHours() + sleepTime.getMinutes()/60;
    const wake = wakeTime.getHours() + wakeTime.getMinutes()/60;
    let hours = wake - sleep;
    if (hours < 0) {
      hours = 24 + hours;
    }
    return hours;
  }

  convert(times:Date[]) {
    //console.log(times); 
    times.map( (time) => {
      time = new Date(time); 
      if (time.getHours() < 12) { // AM 
        return time.setHours(time.getHours()+12); 
      } else { // PM
        return time.setHours(time.getHours()-12); 
      }
    });
    return times; 
  }

  /* MAXIMIZE SLEEP */
  getSleepAmount(end:string) {
    var goalWeight = this.goal > this.recommended[this.ageGroup][end] ? 0.75: 0.25; 
    var sleepHours = goalWeight * this.goal + (1-goalWeight) * this.recommended[this.ageGroup][end];
    var sleepTimeConverted = this.getDecToTime(sleepHours);
    return sleepTimeConverted;
  }

  async getMaxTimes() {
    console.log("inside getMaxTimes"); 
    this.times['max'] = [];
    var latestWakeTime: Date;
    var sleepTime1: Date;
    var sleepTime2: Date;
    var sleepTime3: Date;

    // calculate wake time, later one(firstEvent - 1, wakeGoal)
    latestWakeTime = this.todaysWakeGoal;
    console.log(this.todaysWakeGoal); 
    console.log(this.firstEvent); 
    this.todaysWakeGoal.setDate(this.firstEvent.getDate());
    if (this.firstEvent > this.todaysWakeGoal) {
      latestWakeTime.setHours(this.firstEvent.getHours());
    }

    // wake time - max(goal, rec)
    sleepTime1 = new Date(latestWakeTime);
    sleepTime1.setHours(latestWakeTime.getHours() - Math.max(this.goal, this.recommended[this.ageGroup]['high']));
    this.times['max'].push({'sleep': sleepTime1, 'wake': latestWakeTime, 'hours': this.getHoursSlept(sleepTime1, latestWakeTime), 'chosen':false, 'color':'dark'});

    // low end rec
    sleepTime2 = new Date(latestWakeTime);
    var sleepAmount2 = this.getSleepAmount("low"); 
    sleepTime2.setHours(latestWakeTime.getHours()-sleepAmount2[0]);
    sleepTime2.setMinutes(latestWakeTime.getMinutes()-sleepAmount2[1]);
    this.times['max'].push({'sleep': sleepTime2, 'wake': latestWakeTime, 'hours': this.getHoursSlept(sleepTime2, latestWakeTime), 'chosen':false, 'color':'dark'});

    // high end rec
    sleepTime3 = new Date(latestWakeTime);
    var sleepAmount3 = this.getSleepAmount("high"); 
    sleepTime3.setHours(latestWakeTime.getHours()-sleepAmount3[0]);
    sleepTime3.setMinutes(latestWakeTime.getMinutes()-sleepAmount3[1]);
    this.times['max'].push({'sleep': sleepTime3, 'wake': latestWakeTime, 'hours': this.getHoursSlept(sleepTime3, latestWakeTime), 'chosen':false, 'color':'dark'});
    this.times['max'].sort((a, b) => b['hours']-a['hours']);
    
    console.log("getMaxTimes", this.times['max']);
    return this.times['max'];
  }

  /* CONSISTENT SLEEP */
  //helper function, returns date object with average of dates from parameter
  getAverageTime (waketimes:Date[]):Date {
    var hours = 0;
    waketimes.forEach(element => {
      element = new Date(element); 
      hours = hours + element.getHours() + element.getMinutes()/60;
    });
    hours = hours / (waketimes.length);

    var averageWakeTime = this.getDecToTime(hours);
    var today = new Date();
    today.setHours(averageWakeTime[0], averageWakeTime[1], 0, 0); //maybe need to set date
    return today;
  }

  //helper function
  getAvgHourSlept(minSleptFeelings):number { //[[minslept1, feelings1], [minslept2, feelings2]]
    var denom = 0.0; 
    var sum = 0.0; 
    minSleptFeelings.forEach( (entry) => {
      if (entry[1] == "mediocre") {
        sum += entry[0];
        denom++; 
      } else if (entry[1] == "refreshed") {
        sum += 2*entry[0];
        denom += 2; 
      } 
    });
    return (sum/denom)/60.0; 
  }
  
  // adjust sleep and wake times based on goals
  adjustSleepWake(sleepTime, wakeTime, avgSleepHours) {
    var sleep = new Date(sleepTime);
    var wake = new Date(wakeTime);
    wake.setDate(this.todaysWakeGoal.getDate());
    if (wake > this.todaysWakeGoal) { //sleeping past wake goal column
      if (avgSleepHours < (this.goal-.25)) {
        wake.setMinutes(wake.getMinutes() - 30);
        sleep.setHours(sleep.getHours() - 1);
      } else if (avgSleepHours > (this.goal>.25)){
        wake.setMinutes(wake.getMinutes() - 30);
      } else {
        wake.setMinutes(wake.getMinutes() - 30);
        sleep.setMinutes(sleep.getMinutes() - 30);
      }
    } else { //not conflicting with wake goal column
      if (avgSleepHours < (this.goal-.25)) {
        sleep.setMinutes(sleep.getMinutes()-30);
      } else if (avgSleepHours > (this.goal>.25)){
        sleep.setMinutes(sleep.getMinutes()+30);
      }
    }
    return [sleep, wake];
  }

  async getConsistentTimes() {
    this.times['consistent'] = [];
    const wakeTimes = []
    const sleepTimes = []; 
    const minSleptFeelings = []
    await this.databaseService.getRecentDays(14).then((days) => {
      days.forEach(dayDoc => {
        wakeTimes.push(dayDoc.data().wakeTime.toDate());
        sleepTimes.push(dayDoc.data().sleepTime.toDate());
        minSleptFeelings.push([dayDoc.data().minSlept, dayDoc.data().feeling]);
      });
    });
    const avgSleepHours = this.getAvgHourSlept(minSleptFeelings);
    var hrsSlept = this.getDecToTime(avgSleepHours);

    // TIME 1: sleep based on wake
    // calculate wake time 1, earliest(average of last 14 wake times, first event tomorrow) p1
    var wakeTime1 = this.getAverageTime(wakeTimes);
    // calculate sleep time 1
    var sleepTime1 = new Date();
    sleepTime1.setHours(wakeTime1.getHours()-hrsSlept[0], wakeTime1.getMinutes()-hrsSlept[1], 0, 0);
    [sleepTime1, wakeTime1] = this.adjustSleepWake(sleepTime1, wakeTime1, avgSleepHours);
    // p2
    wakeTime1.setDate(this.firstEvent.getDate());
    if (wakeTime1 > this.firstEvent)
      wakeTime1 = this.firstEvent;
    this.times['consistent'].push({'sleep': sleepTime1, 'wake': wakeTime1, 'hours': this.getHoursSlept(sleepTime1, wakeTime1), 'chosen':false, 'color':'dark'});

    // TIME 2: consistent sleep time
    var adjustedSleepTimes = this.convert(sleepTimes);
    var sleepTime2 = this.getAverageTime(adjustedSleepTimes); 
    [sleepTime2] = this.convert([sleepTime2]); // map back to correct hour/min
    var wakeTime2 = new Date();
    wakeTime2.setHours(sleepTime2.getHours()+hrsSlept[0], sleepTime2.getMinutes()+hrsSlept[1], 0, 0);
    [sleepTime2, wakeTime2] = this.adjustSleepWake(sleepTime2, wakeTime2, avgSleepHours);
    wakeTime2.setDate(this.firstEvent.getDate());
    if (wakeTime2 > this.firstEvent) {
      wakeTime2 = this.firstEvent; 
    }
    this.times['consistent'].push({'sleep': sleepTime2, 'wake':wakeTime2, 'hours': this.getHoursSlept(sleepTime2, wakeTime2), 'chosen':false, 'color':'dark'});

    // TIME 3: average of 1 & 2
    [sleepTime1, sleepTime2] = this.convert([sleepTime1, sleepTime2]); 
    var sleepTime3 = this.getAverageTime([sleepTime1, sleepTime2]);
    [sleepTime1, sleepTime2] = this.convert([sleepTime1, sleepTime2]); // we do not actually want to change 1 & 2
    [sleepTime3] = this.convert([sleepTime3]); // map back to correct hour/min
    var wakeTime3 = this.getAverageTime([wakeTime1, wakeTime2]);
    wakeTime3.setDate(this.firstEvent.getDate());
    if (wakeTime3 > this.firstEvent) {
      wakeTime3 = this.firstEvent; 
    }
    this.times['consistent'].push({'sleep': sleepTime3, 'wake':wakeTime3, 'hours': this.getHoursSlept(sleepTime3, wakeTime3), 'chosen':false, 'color':'dark'});
    this.times['consistent'].sort((a, b) => a['wake'].getTime() - b['wake'].getTime());
    
    console.log("getConsistentTimes", this.times['consistent']);
    return this.times['consistent'];
  }

  /* OVERALL BEST */
  // helper function to handle conversion and calculating avg sleep times
  averageSleepTimes(sleepTimes:Date[]) {
    sleepTimes = this.convert(sleepTimes);
    var avgSleepTime = this.getAverageTime(sleepTimes);
    sleepTimes = this.convert(sleepTimes);
    [avgSleepTime] = this.convert([avgSleepTime]); 
    return avgSleepTime; 
  }
  
  async getOverallTimes() {
    this.times['overall'] = [];
    var sleepTimes = []; 
    var wakeTimes = []
    
    // pure avg of all six above 
    // get times into list format to pass to avg function
    Object.entries(this.times).forEach( (list) => {
      list[1].forEach ( (time) =>{
        sleepTimes.push(time['sleep']); 
        wakeTimes.push(time['wake']); 
      });
    });

    var sleepTime1 = this.averageSleepTimes(sleepTimes); 
    var wakeTime1 = this.getAverageTime(wakeTimes); 
    this.times['overall'].push({'sleep':sleepTime1, 'wake':wakeTime1, 'hours': this.getHoursSlept(sleepTime1, wakeTime1), 'chosen':false, 'color':'dark'});

    // avg of top two in each category
    sleepTimes = [this.times['max'][0].sleep, this.times['max'][1].sleep, this.times['consistent'][0].sleep, this.times['consistent'][1].sleep];
    wakeTimes = [this.times['max'][0].wake, this.times['max'][1].wake, this.times['consistent'][0].wake, this.times['consistent'][1].wake];
    var sleepTime2 = this.averageSleepTimes(sleepTimes); 
    var wakeTime2 = this.getAverageTime(wakeTimes); 
    this.times['overall'].push({'sleep':sleepTime2, 'wake':wakeTime2, 'hours': this.getHoursSlept(sleepTime2, wakeTime2), 'chosen':false, 'color':'dark'});
    
    // avg of earliest wake times in each category + corresponding avg sleep times
    this.times['max'].sort( (a, b) => a['wake'].getTime()-b['wake'].getTime());
    // relative to wake time
    const earliestMax = this.times['max'][0];
    const latestMax = this.times['max'][0];
    this.times['max'].sort((a, b) => b['hours']-a['hours']); // sort back for ranking by hour
    sleepTimes = [earliestMax.sleep, this.times['consistent'][0].sleep]; // make lists out of top entry in each category 
    wakeTimes = [earliestMax.wake, this.times['consistent'][0].wake];
    var sleepTime3 = this.averageSleepTimes(sleepTimes); 
    var wakeTime3 = this.getAverageTime(wakeTimes); 
    this.times['overall'].push({'sleep':sleepTime3, 'wake':wakeTime3, 'hours': this.getHoursSlept(sleepTime3, wakeTime3), 'chosen':false, 'color':'dark'});
    
    // avg of latest wake times from each category
    sleepTimes = [latestMax.sleep, this.times['consistent'][2].sleep]; // make lists of out top entry in each category 
    wakeTimes = [latestMax.wake, this.times['consistent'][2].wake]; 
    var sleepTime4 = this.averageSleepTimes(sleepTimes);
    var wakeTime4 = this.getAverageTime(wakeTimes); 
    this.times['overall'].push({'sleep':sleepTime4, 'wake':wakeTime4, 'hours': this.getHoursSlept(sleepTime4, wakeTime4), 'chosen':false, 'color':'dark'});
    this.times['overall'].sort( (a, b) => a['wake'].getTime()-b['wake'].getTime());
    
    console.log("getOverallTimes", this.times['overall']);
    return this.times['overall'];
  }

  async getAllTimes() {
    // this.getData(); 
    await this.getMaxTimes(); 
    await this.getConsistentTimes(); 
    await this.getOverallTimes(); 
    return this.times; 
  }
}

