import { Injectable } from '@angular/core';
import { min } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class RecommenderService {
  ageGroup: string;
  goal: number; 
  wakeGoal;
  recentDays;
  // Sleep Foundation recommended hours of sleep per age
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
      this.databaseService.getUser(currentUser.uid).then(value => {
        this.ageGroup = value.ageGroup; 
        this.goal = value.goal;

        // get dateTime for wakeGoal
        var wakeTime = value.wakeGoal;

        this.wakeGoal = new Date();
        if (this.wakeGoal.toLocaleTimeString.substr(this.wakeGoal.toLocaleTimeString.length-2) == "PM") { //set to tomorrow
          this.wakeGoal.setDate(this.wakeGoal.getDate() + 1);
        }
        this.wakeGoal.setHours(wakeTime.getHours());
        this.wakeGoal.setHours(wakeTime.getMinutes());
    
      });
    });
    //this.wakeGoal = this.wake;
    
    console.log(this.authenticationService.calendarItems); //datetimes
  }
  //access earliest calendar event using this.authencationService.calendarItems()


  //
  
  getMaxTimes() {
    var times = [];

    //need to get calendar events for the next day
    var latestWakeTime: Date;
    var sleepTime1: Date;
    var sleepTime2: Date;
    var sleepTime3: Date;

    //calculate wake time
    latestWakeTime = this.wakeGoal;
    if (this.authenticationService.calendarItems.length > 0 && this.authenticationService.calendarItems[0].startTime < this.wakeGoal) {
      var firstEvent = this.authenticationService.calendarItems[0].startTime;      
      latestWakeTime.setHours(firstEvent.getHours() - 1);
    }
    
    //sleepTime = latestWakeTime - recommended[ageGroup][high]
    sleepTime1 = latestWakeTime;
    sleepTime1.setHours(latestWakeTime.getHours() - this.recommended[this.ageGroup]['high']);
    times.push({'sleep': sleepTime1, 'wake': latestWakeTime});

    //returns array: [sleepHours, sleepMins]
    function getSleepAmount(end:string) {
      var goalWeight = this.goal > this.recommended[this.ageGroup][end] ? 0.75: 0.25; 
      var sleepHours = goalWeight * this.goal + (1-goalWeight) * this.recommended[this.ageGroup][end];
      var sleepTimeConverted = this.getDecToTime(sleepHours);
      return sleepTimeConverted;
      //return latestWakeTime - (goalWeight*this.goal + recWeight*this.recommended[this.ageGroup].end)
    }

    // low end rec
    sleepTime2 = latestWakeTime;
    var sleepAmount2 = getSleepAmount('low'); 
    sleepTime2.setHours(latestWakeTime.getHours()-sleepAmount2[0]);
    sleepTime2.setMinutes(latestWakeTime.getMinutes()-sleepAmount2[1]);
    times.push({'sleep': sleepTime2, 'wake': latestWakeTime});

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

    var avgWake = wakeSum/10; // change format/type conversion as needed
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

