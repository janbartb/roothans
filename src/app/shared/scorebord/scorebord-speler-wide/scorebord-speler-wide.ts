import { Component, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { ScorebordWideInfo } from '../scorebord-wide/scorebord-wide-info/scorebord-wide-info';
import { ScorebordWideStand } from '../scorebord-wide/scorebord-wide-stand/scorebord-wide-stand';
import { ScorebordWideLaatste5 } from '../scorebord-wide/scorebord-wide-laatste5/scorebord-wide-laatste5';
import { ScorebordWideExtra } from '../scorebord-wide/scorebord-wide-extra/scorebord-wide-extra';
import { ScorebordWideBal } from '../scorebord-wide/scorebord-wide-bal/scorebord-wide-bal';
import { ScorebordWideStatus } from '../scorebord-wide/scorebord-wide-status/scorebord-wide-status';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-speler-wide',
    imports: [
        ScorebordWideInfo,
        ScorebordWideStand,
        ScorebordWideStatus,
        ScorebordWideLaatste5,
        ScorebordWideBal,
        ScorebordWideExtra,
        NgClass
    ],
    templateUrl: './scorebord-speler-wide.html',
    styleUrl: './scorebord-speler-wide.css',
})
export class ScorebordSpelerWide implements OnInit {
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() isVijfde: boolean = false;
    @Input() position: string = 'left';
    meteenToev: boolean = false;

    formatCar: string = '009';
    formatBrt: string = '009';
    formatSer: string = '009';

    ngOnInit(): void {
        if (this.speler.splTsCar > 0) {
            if (this.speler.splTsCar < 100) {
                this.formatCar = this.formatSer = '09';
            }
        }
        if (this.maxBrt > 0) {
            if (this.maxBrt < 100) {
                this.formatBrt = '09';
            }
        }
        this.meteenToev = true;
    }

}
