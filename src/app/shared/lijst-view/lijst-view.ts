import { Component, Input, OnInit } from '@angular/core';
import { LijstScore, LijstSpeler } from '../../model/speler';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-lijst-view',
    imports: [
        NgClass
    ],
    templateUrl: './lijst-view.html',
    styleUrl: './lijst-view.css',
})
export class LijstView implements OnInit {
    @Input() spelers: LijstSpeler[] = [];
    totBrt: number = 0;

    ngOnInit(): void {
        this.totBrt = 20;
        this.spelers.forEach(spl => {
            spl.scores = [];
            for (let i = 0; i < this.totBrt; i++) {
                spl.scores.push(new LijstScore(i + 1));
            }
            let tot = 0;
            spl.score.forEach((car, idx) => {
                if (car == 0) {
                    spl.scores[idx].car = '--';
                    spl.scores[idx].tot = '--';
                    spl.scores[idx].filler = false;
                }
                else {
                    tot += car;
                    spl.scores[idx].car = '' + car;
                    spl.scores[idx].tot = '' + tot;
                    spl.scores[idx].filler = false;
                }
            })
        });
    }
}
