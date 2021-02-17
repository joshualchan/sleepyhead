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
    const doc = await this.db.collection("users").doc(userid).get();
    if (doc.exists) {
      return doc.data();
    } else {
      console.log("no user ", userid);
      return Promise.reject();
    }
  }

  createUser(userid, age, goal) {
    this.db.collection("users").doc(userid).set({
      age: age,
      goal: goal,
      days: {}
    }).catch((error) => {
      console.error("Error creating user:", error);
    });
  }

  updateWakeInfo(sleepTime:Date, wakeTime:Date, minSlept) {
    this.sleepTime = sleepTime;
    this.wakeTime = wakeTime;
    this.minSlept = minSlept;
    this.day = (wakeTime.getMonth() + 1) + "/" + wakeTime.getDate() + "/" + wakeTime.getFullYear(); 
  }

  updateFeeling(feeling) {
    this.feeling = feeling;
  }

  logToday(userid) {
    this.db.collection("users").doc(userid).update({
      days: {
        [this.day]: [this.sleepTime, this.wakeTime, this.minSlept, this.feeling]
      }
    }).catch((error) => {
      console.error("Error logging today:", error);
    });
  }

  // these functions have not been tested
  // getAge(userid) {
  //   return this.db.collection("users").doc(userid).get().then((doc) => {
  //     if (doc.exists) {
  //       return doc.data().age;
  //     } else {
  //       console.log("Can not get age");
  //       return -1;
  //     }
  //   });
  // }

  // getGoal(userid) {
  //   return this.db.collection("users").doc(userid).get().then((doc) => {
  //     if (doc.exists) {
  //       return doc.data().goal;
  //     } else {
  //       console.log("Can not get goal");
  //       return -1;
  //     }
  //   });
  // }
}