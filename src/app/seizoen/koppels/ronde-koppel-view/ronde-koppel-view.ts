import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RondeKoppel } from '../../../model/koppel';
import { KoppelSpeler } from '../../../model/speler';
import { DecimalPipe, NgClass } from '@angular/common';
import { SpeelDag } from '../../../model/seizoen';

@Component({
    selector: 'app-ronde-koppel-view',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './ronde-koppel-view.html',
    styleUrl: './ronde-koppel-view.css',
})
export class RondeKoppelView {
    @Input() koppel: RondeKoppel = new RondeKoppel();
    @Input() rang: number = 0;
    @Input() view: string = 'normal';
    @Input() speelDagen: SpeelDag[] = [];
    @Input() selectable: boolean = true;
    @Output() hovered: EventEmitter<RondeKoppel> = new EventEmitter();
    @Output() clicked: EventEmitter<RondeKoppel> = new EventEmitter();
    @Output() dblClicked: EventEmitter<RondeKoppel> = new EventEmitter();
    aantGespeeld: number = 0;
    punten: number[] = [0, 0];

    koppelClicked() {
        this.clicked.emit(this.koppel);
    }

    koppelDblClicked() {
        this.dblClicked.emit(this.koppel);
    }

    hover() {
        this.hovered.emit(this.koppel);
    }

    // voorkeurDagClicked(dagNr: number) {
    //     if (this.koppel.voorkeurDagen.includes(dagNr)) {
    //         this.koppel.voorkeurDagen = this.koppel.voorkeurDagen.filter(nr => nr != dagNr);
    //     }
    //     else {
    //         this.koppel.voorkeurDagen.push(dagNr);
    //     }
    //     this.dagClicked.emit(this.koppel);
    // }

    ngOnInit(): void {
        if (this.koppel.spelers[0].splMoy > this.koppel.spelers[1].splMoy) {
            const temp: KoppelSpeler = JSON.parse(JSON.stringify(this.koppel.spelers[0]));
            this.koppel.spelers[0] = this.koppel.spelers[1];
            this.koppel.spelers[1] = temp;
        }
        this.aantGespeeld = 0;
        this.koppel.matches.forEach(match => {
            match.wedstrijden.forEach((wed, idx) => {
                if (wed.uitslag.brt > 0) {
                    this.aantGespeeld++;
                    this.punten[idx] += wed.uitslag.pnt;
                }
            });
        });
    }

}
