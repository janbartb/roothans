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
        this.spelers.forEach((spl, idxS) => {
            let hcap = 0;
            const teg = this.spelers[Math.abs(idxS - 1)];
            if (teg.speler.splHand < spl.speler.splHand) {
                hcap = spl.speler.splHand - teg.speler.splHand;
            }
            spl.scores = [];
            for (let i = 0; i < this.totBrt; i++) {
                spl.scores.push(new LijstScore(i + 1));
            }
            let tot = 0 + hcap;
            spl.score.forEach((car, idx) => {
                if (car == 0) {
                    spl.scores[idx].car = '--';
                    spl.scores[idx].tot = '--';
                    spl.scores[idx].filler = false;
                    if (idx == 0 && tot > 0) {
                        spl.scores[idx].tot = '' + tot;
                    }
                }
                else {
                    tot += car;
                    spl.scores[idx].car = '' + car;
                    spl.scores[idx].tot = '' + tot;
                    spl.scores[idx].filler = false;
                }
            })
        });
        console.log(this.spelers);
    }
}
