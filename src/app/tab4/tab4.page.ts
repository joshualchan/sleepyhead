import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  times = {
    'max': [{'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
            {'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
            {'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'}],
    'consistent': [{'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                  {'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                  {'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'}],
    'overall': [{'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                {'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'},
                {'sleep':'12:00am', 'wake': '8:00am', 'chosen':false, 'color':'dark'}]
  }

  constructor() { }

  ngOnInit() {
  }

  chooseTime(index:number, category:string) {
    console.log("clicked");

    Object.keys(this.times).forEach( (category) => {
      this.times[category].forEach( (option) => {
        option.chosen = false; 
        option.color = "dark"; 
      });
    });

    this.times[category][index].chosen = true; 
    this.times[category][index].color = "success";
    
    // return or save chosen time to db 
  }

}
