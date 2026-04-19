import { Component, inject, input, Input, OnInit, signal } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { ScorebordTallInfo } from '../scorebord-tall/scorebord-tall-info/scorebord-tall-info';
import { ScorebordTallStand } from '../scorebord-tall/scorebord-tall-stand/scorebord-tall-stand';
import { ScorebordTallStatus } from '../scorebord-tall/scorebord-tall-status/scorebord-tall-status';
import { ScorebordTallLaatste5 } from '../scorebord-tall/scorebord-tall-laatste5/scorebord-tall-laatste5';
import { ScorebordTallExtra } from '../scorebord-tall/scorebord-tall-extra/scorebord-tall-extra';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-speler',
    imports: [
        ScorebordTallInfo,
        ScorebordTallStand,
        ScorebordTallStatus,
        ScorebordTallLaatste5,
        ScorebordTallExtra,
        NgClass
    ],
    templateUrl: './scorebord-speler.html',
    styleUrl: './scorebord-speler.css',
})
export class ScorebordSpeler implements OnInit {
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() teamCar: number = 0;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
    @Input() isVijfde: boolean = false;
    @Input() hilite: string = '';
    @Input() position: string = 'left';
    meteenToev: boolean = false;

    formatCar: string = '009';
    formatBrt: string = '009';
    formatSer: string = '009';

    ngOnInit(): void {
        if (this.speler.splTsCar > 0 || this.teamCar > 0) {
            const tsCar = (this.teamCar > 0) ? this.teamCar : this.speler.splTsCar;
            if (tsCar < 100) {
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
