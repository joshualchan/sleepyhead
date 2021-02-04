import { Injectable } from '@angular/core';

import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  db;

  constructor() { 
    this.db = firebase.firestore();
  }

  isUser(userid): boolean {
    return this.db.collection("users").doc(userid).get().then((doc) => {
      if (doc.exists) {
        console.log(doc.data());
        return true;
      } else {
        return false;
      }
    });
  }

  createUser(userid, age, goal) {
    this.db.collection("users").doc(userid).set({
      age: age,
      goal: goal
    }).catch((error) => {
      console.error("Error creating user:", error);
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
