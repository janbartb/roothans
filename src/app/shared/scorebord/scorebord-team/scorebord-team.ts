import { Component, Input, OnInit } from '@angular/core';
import { WedTeam } from '../../../model/wedstrijd';
import { ScorebordWideInfo } from '../scorebord-wide/scorebord-wide-info/scorebord-wide-info';
import { ScorebordWideStand } from '../scorebord-wide/scorebord-wide-stand/scorebord-wide-stand';
import { ScorebordWideStatus } from '../scorebord-wide/scorebord-wide-status/scorebord-wide-status';
import { ScorebordWideLaatste5 } from '../scorebord-wide/scorebord-wide-laatste5/scorebord-wide-laatste5';
import { ScorebordWideBal } from '../scorebord-wide/scorebord-wide-bal/scorebord-wide-bal';
import { ScorebordWideExtra } from '../scorebord-wide/scorebord-wide-extra/scorebord-wide-extra';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-team',
    imports: [
        ScorebordWideInfo,
        ScorebordWideStand,
        ScorebordWideStatus,
        ScorebordWideLaatste5,
        ScorebordWideBal,
        ScorebordWideExtra,
        NgClass
    ],
    templateUrl: './scorebord-team.html',
    styleUrl: './scorebord-team.css',
})
export class ScorebordTeam implements OnInit {
    @Input() team: WedTeam = new WedTeam();
    @Input() maxBrt: number = 0;
    @Input() isVijfde: boolean = false;
    @Input() position: string = 'left';
    meteenToev: boolean = false;

    formatCar: string = '009';
    formatBrt: string = '009';
    formatSer: string = '009';

    ngOnInit(): void {
        if (this.team.teamTsCar > 0) {
            if (this.team.teamTsCar < 100) {
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
