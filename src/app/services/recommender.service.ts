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
    
    sleepTime = 
    //var times = [];
    
    // end is low or high
    function getSleepTime(end:string) {
      var goalWeight = this.goal > this.recommended[this.ageGroup].end ? 0.75: 0.25; 
      var recWeight = this.recommended[this.ageGroup].end > this.goal ? 0.75: 0.25;  
      //return latestWakeTime - (goalWeight*this.goal + recWeight*this.recommended[this.ageGroup].end)
    }

    // low end rec
    //var sleepTime = getSleepTime('low'); 
    
    //high end rec
    //var sleepTime = getSleepTime('high'); 
    
    //return list of dictionaries
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
    

    //avg of earliest wake times in each category + corresponding avg sleep times
    for (var key in this.times) {
      this.times[key].sort( (a, b) => {
        return a.wake - b.wake; 
      });
    }
    

    function getAvg() { 
      var SleepSum = 0; 
        var WakeSum = 0; 
        for (var key in this.times) {
          SleepSum += this.times[key][0].sleep;
          WakeSum += this.times[key][0].wake;
        }
        overallTimes.push({'sleep':sleepSum/3, 'wake':wakeSum/3}); 
    }
    
    // avg of latest wake tiems from each category
    for (var key in this.times) {
      this.times[key].sort( (a, b) => {
        return b.wake - a.wake; 
      });
    }
    
    // avg of earliest sleep times from each category
    for (var key in this.times) {
      this.times[key].sort( (a, b) => {
        return a.sleep - b.sleep; 
      });
    }
  }
}

