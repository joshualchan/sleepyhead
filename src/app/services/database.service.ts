import { Injectable } from '@angular/core';

import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  db;
  private day;
  private sleepTime;
  private wakeTime;
  private minSlept;
  private feeling;

  constructor() { 
    this.db = firebase.firestore();
  }

  async getUser(userid) {
    const doc = await this.db.collection(userid).doc("basicInfo").get();
    if (doc.exists) {
      return doc.data();
    } else {
      console.log("no user ", userid);
      return Promise.reject();
    }
  }

  createUser(userid, age, ageGroup, goal, wakeGoal) {
    this.db.collection(userid).doc("basicInfo").set({
      age: age,
      ageGroup: ageGroup,
      goal: goal,
      wakeGoal: wakeGoal,
    }).catch((error) => {
      console.error("Error creating user:", error);
    });
    this.db.collection(userid).doc("sleepSchedule").set({ 
    }).catch((error) => {
      console.error("Error creating user:", error);
    });
  }

  updateWakeInfo(sleepTime:Date, wakeTime:Date, minSlept) {
    this.sleepTime = sleepTime;
    this.wakeTime = wakeTime;
    this.minSlept = minSlept;
    this.day = (wakeTime.getMonth() + 1) + "-" + wakeTime.getDate() + "-" + wakeTime.getFullYear(); 
  }

  updateFeeling(feeling) {
    this.feeling = feeling;
  }

  logToday(userid) {
    this.db.collection(userid).doc("sleepSchedule").update({
      [this.day]: [this.sleepTime, this.wakeTime, this.minSlept, this.feeling]
    }).catch((error) => {
      console.error("Error logging today:", error);
    });
  }

  async getRecentDays(userid) {
    const days = await this.db.collection(userid).doc("sleepSchedule")
                        .where()
                        .get();
    if (days.exists) {
      return days.data();
    } else {
      console.log("user has no sleep schedule logged");
      return Promise.reject();
    }
    }).catch((error) => {
      console.error("Error logging today:", error);
    });
  }

  async getRecentDays(userid) {
    const days = await this.db.collection(userid).doc("sleepSchedule")
                        .where()
                        .get();
    if (days.exists) {
      return days.data();
    } else {
      console.log("user has no sleep schedule logged");
      return Promise.reject();
    }
  }
}