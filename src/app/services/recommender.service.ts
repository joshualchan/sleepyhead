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
  /*
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
  }*/
  
  
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

          this.todaysWakeGoal = new Date();
          if (this.todaysWakeGoal.getHours() >= 12) { // set to tomorrow if PM
            this.todaysWakeGoal.setDate(this.todaysWakeGoal.getDate() + 1);
          }
          this.todaysWakeGoal.setHours(this.wakeGoal.getHours());
          this.todaysWakeGoal.setMinutes(this.wakeGoal.getMinutes());

          this.authenticationService.getCalendar();
        }).catch( () => console.log("userDoc not set in db service") );
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

  /* MAXIMIZE SLEEP */
  getSleepAmount(end:string) {
    var goalWeight = this.goal > this.recommended[this.ageGroup][end] ? 0.75: 0.25; 
    var sleepHours = goalWeight * this.goal + (1-goalWeight) * this.recommended[this.ageGroup][end];
    var sleepTimeConverted = this.getDecToTime(sleepHours);
    return sleepTimeConverted;
  }

  getMaxTimes() {
    var times = [];
    var latestWakeTime: Date;
    var sleepTime1: Date;
    var sleepTime2: Date;
    var sleepTime3: Date;

    // calculate wake time
    latestWakeTime = this.todaysWakeGoal;
    if (this.authenticationService.calendarItems.length > 0){
      var adjustedStartTime = new Date(this.authenticationService.calendarItems[0].startTime);
      adjustedStartTime.setHours(adjustedStartTime.getHours() - 1);
      if (adjustedStartTime < this.todaysWakeGoal) {
        latestWakeTime.setHours(adjustedStartTime.getHours());
      }
    }

    // wake time - max(goal, rec)
    sleepTime1 = new Date(latestWakeTime);
    sleepTime1.setHours(latestWakeTime.getHours() - Math.max(this.goal, this.recommended[this.ageGroup]['high']));
    times.push({'sleep': sleepTime1, 'wake': latestWakeTime});

    // low end rec
    sleepTime2 = new Date(latestWakeTime);
    var sleepAmount2 = this.getSleepAmount("low"); 
    sleepTime2.setHours(latestWakeTime.getHours()-sleepAmount2[0]);
    sleepTime2.setMinutes(latestWakeTime.getMinutes()-sleepAmount2[1]);
    times.push({'sleep': sleepTime2, 'wake': latestWakeTime});

    // high end rec
    sleepTime3 = new Date(latestWakeTime);
    var sleepAmount3 = this.getSleepAmount("high"); 
    sleepTime3.setHours(latestWakeTime.getHours()-sleepAmount3[0]);
    sleepTime3.setMinutes(latestWakeTime.getMinutes()-sleepAmount3[1]);
    times.push({'sleep': sleepTime3, 'wake': latestWakeTime});

    console.log(times);
    return times;
  }

  /* CONSISTENT SLEEP */
  getAverageWakeTimes (waketimes: Date[]) {
    var hours = 0;
    waketimes.forEach(element => {
      hours = hours + element.getHours() + element.getMinutes()/60;
    });
    hours = hours / (waketimes.length);
    this.getDecToTime(hours); // should be date
  }

  async getConsistentTimes() {
    const wakeTimes = []
    const sleepTimes = []
    
    await this.databaseService.getRecentDays(14).then((days) => {
      days.forEach(dayDoc => {
        wakeTimes.push(dayDoc.data().wakeTime.toDate());
        sleepTimes.push(dayDoc.data().sleepTime.toDate());
      })
    });

    this.getAverageWakeTimes(wakeTimes);
  }

  /* OVERALL BEST */
  getOverallTimes() {
    var overallTimes = []; 
    // JUST THE MATH LOGIC, WILL CHANGE ACCORDING TO HOW FORMAT OF OTHER TIMES ARE STORED
    
    // pure avg of all six above 
    for (var key in this.times) {
      var wakeSum = this.times[key].reduce( (total, time) => {
        return total += time.wake; // change depending on how time is stored + check for pm
      }); 

      var sleepSum = this.times[key].reduce( (total, time) => {
        return total += time.sleep; // change depending on how time is stored + check for pm
      });  
    }

    var avgWake = wakeSum/6; // change format/type conversion as needed
    var avgSleep = sleepSum/6;
    overallTimes.push({'sleep':avgSleep.toString, 'wake':avgWake.toString()})

    function getAvg() { 
      var SleepSum = 0; 
        var WakeSum = 0; 
        for (var key in this.times) {
          SleepSum += this.times[key][0].sleep;
          WakeSum += this.times[key][0].wake;
        }
        overallTimes.push({'sleep':sleepSum/2, 'wake':wakeSum/2}); 
    }
    

    //avg of earliest wake times in each category + corresponding avg sleep times
    for (var key in this.times) {
      this.times[key].sort( (a, b) => {
        return a.wake - b.wake; 
      });
    }
    getAvg(); 
    
    
    // avg of latest wake tiems from each category
    for (var key in this.times) {
      this.times[key].sort( (a, b) => {
        return b.wake - a.wake; 
      });
    }
    getAvg(); 
    
    // avg of earliest sleep times from each category
    for (var key in this.times) {
      this.times[key].sort( (a, b) => {
        return a.sleep - b.sleep; 
      });
    }
    getAvg(); 
  }
}

