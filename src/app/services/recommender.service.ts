import { Injectable } from '@angular/core';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class RecommenderService {
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
      const goal = this.databaseService.userDoc.goal;
      const wakeGoal = this.databaseService.userDoc.wakeGoal;

      if (currentUser && currentUser.uid) {
        this.todaysWakeGoal = new Date(); // DISC: better to use today in db service? move today here?
        if (this.todaysWakeGoal.getHours() >= 12) { // set to tomorrow if PM
          this.todaysWakeGoal.setDate(this.todaysWakeGoal.getDate() + 1);
        }
        this.todaysWakeGoal.setHours(wakeGoal.getHours());
        this.todaysWakeGoal.setHours(wakeGoal.getMinutes());
      }
    });
    //this.todaysWakeGoal = this.wake;
    console.log(this.authenticationService.calendarItems); //datetimes
  }
  //access earliest calendar event using this.authencationService.calendarItems()

  // DISC: setting sleep based on wake issues
  getMaxTimes() {
    const ageGroup = this.databaseService.userDoc.ageGroup;

    var times = [];

    //need to get calendar events for the next day
    var latestWakeTime: Date;
    var sleepTime1: Date;
    var sleepTime2: Date;
    var sleepTime3: Date;

    //calculate wake time
    latestWakeTime = this.todaysWakeGoal;
    if (this.authenticationService.calendarItems.length > 0 && this.authenticationService.calendarItems[0].startTime < this.todaysWakeGoal) { // -1 here?
      var firstEvent = this.authenticationService.calendarItems[0].startTime;      
      latestWakeTime.setHours(firstEvent.getHours() - 1);
    }
    
    //sleepTime = latestWakeTime - recommended[ageGroup][high] // should be checking no more than XX hours above max(goal, rec)
    sleepTime1 = latestWakeTime;
    sleepTime1.setHours(latestWakeTime.getHours() - this.recommended[ageGroup]['high']);
    times.push({'sleep': sleepTime1, 'wake': latestWakeTime});

    //returns array: [sleepHours, sleepMins]
    function getSleepAmount(end:string) {
      var goalWeight = this.goal > this.recommended[ageGroup][end] ? 0.75: 0.25; 
      var sleepHours = goalWeight * this.goal + (1-goalWeight) * this.recommended[ageGroup][end];
      var sleepTimeConverted = this.getDecToTime(sleepHours);
      return sleepTimeConverted;
      //return latestWakeTime - (goalWeight*this.goal + recWeight*this.recommended[ageGroup].end)
    }

    // low end rec
    sleepTime2 = latestWakeTime;
    var sleepAmount2 = getSleepAmount('low'); 
    sleepTime2.setHours(latestWakeTime.getHours()-sleepAmount2[0]);
    sleepTime2.setMinutes(latestWakeTime.getMinutes()-sleepAmount2[1]);
    times.push({'sleep': sleepTime2, 'wake': latestWakeTime});

    // high end rec
    sleepTime3 = latestWakeTime;
    var sleepAmount3 = getSleepAmount('low'); 
    sleepTime3.setHours(latestWakeTime.getHours()-sleepAmount3[0]);
    sleepTime3.setMinutes(latestWakeTime.getMinutes()-sleepAmount3[1]);
    times.push({'sleep': sleepTime3, 'wake': latestWakeTime});

    console.log(times);
    return times;
  }

  getDecToTime(hours: number) {
    //example: 9.25 hrs converts to 9 hrs 15 min, NOT 25 min
    var sleepHours = Math.floor(hours);
    hours -= Math.floor(hours);
    var sleepMins = 60 * hours;
    return [sleepHours, sleepMins];
  }
  
  getConsistentTimes() {

  }

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

    var avgWake = wakeSum/10; // change format/type conversion as needed // 10 or 6?
    var avgSleep = sleepSum/10;
    overallTimes.push({'sleep':avgSleep.toString, 'wake':avgWake.toString()})

    function getAvg() { 
      var SleepSum = 0; 
        var WakeSum = 0; 
        for (var key in this.times) {
          SleepSum += this.times[key][0].sleep;
          WakeSum += this.times[key][0].wake;
        }
        overallTimes.push({'sleep':sleepSum/3, 'wake':wakeSum/3}); 
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

