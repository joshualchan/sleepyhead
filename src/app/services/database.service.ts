import { Injectable } from '@angular/core';

import firebase from 'firebase/app';
import 'firebase/firestore';

import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  db;
  uid;
  userDoc;
  // variables to help log today
  private today: Date;
  private sleepTime: Date;
  private wakeTime: Date;
  private minSlept;
  private feeling;

  constructor(
    private authenticationService: AuthenticationService
  ) { 
    this.db = firebase.firestore();
    this.authenticationService.user$.subscribe((currentUser) => {
      if (currentUser && currentUser.uid) {
        this.setUser(currentUser.uid);
        this.getUser().catch( () => console.log("userDoc not set in db service") );
      }
    });
    // today assumes the user does not visit the app after pressing sleep
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);
  }

  setUser(userid) {
    this.uid = userid;
  }

  async getUser() {
    const doc = await this.db.collection("users").doc(this.uid).get();
    if (doc.exists) {
      this.userDoc = doc.data();
      return doc.data();
    } else {
      console.log("no user ", this.uid);
      return Promise.reject();
    }
  }

  createUser(age, ageGroup, goal, wakeGoal) {
    this.db.collection("users").doc(this.uid).set({
      age: age,
      ageGroup: ageGroup,
      goal: goal,
      wakeGoal: wakeGoal
    }).then(
      this.getUser().catch( () => console.log("userDoc not set in db service"))
    ).catch((error) => {
      console.error("Error creating user:", error);
    });
  }

  updateWakeInfo(sleepTime:Date, wakeTime:Date, minSlept) {
    this.sleepTime = sleepTime;
    this.wakeTime = wakeTime;
    this.minSlept = minSlept;
  }

  updateFeeling(feeling) {
    this.feeling = feeling;
  }

  logToday() {
    const todayString = (this.today.getMonth()+1) + "-" + this.today.getDate() + "-" + this.today.getFullYear();
    this.db.collection("users").doc(this.uid).collection("sleepSchedule").doc(todayString).set({
      today: this.today.getTime(),
      sleepTime: this.sleepTime,
      wakeTime: this.wakeTime,
      minSlept: this.minSlept,
      feeling: this.feeling
    }).catch((error) => {
      console.error("Error logging today:", error);
    });
  }

  async getRecentDays(numDays) {
    const dateThreshold = new Date(this.today);
    dateThreshold.setDate(dateThreshold.getDate() - numDays);
    console.log("dateThreshold is ", dateThreshold.getTime());
    const days = await this.db.collection("users").doc(this.uid).collection("sleepSchedule")
                              .where("today", ">", dateThreshold.getTime()).get();
    if (days.docs.length > 0) {
      return days.docs;
    } else {
      console.log("user has no sleep schedule logged");
      return Promise.reject();
    }
  }
}