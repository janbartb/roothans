import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Koppel } from '../../../model/koppel';
import { KoppelSpeler } from '../../../model/speler';
import { DecimalPipe, NgClass } from '@angular/common';
import { SpeelDag } from '../../../model/seizoen';
import { RondeKoppel, RondeKoppelSpeler } from '../../../model/ronde';

@Component({
    selector: 'app-koppel-row',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './koppel-row.html',
    styleUrl: './koppel-row.css',
})
export class KoppelRow implements OnInit {
    @Input() koppel: Koppel = new Koppel();
    @Input() pouleKoppel: RondeKoppel = new RondeKoppel(new Koppel());
    @Input() rang: number = 0;
    @Input() view: string = 'normal';
    @Input() speelDagen: SpeelDag[] = [];
    @Input() selectable: boolean = true;
    @Output() hovered: EventEmitter<Koppel> = new EventEmitter<Koppel>();
    @Output() clicked: EventEmitter<Koppel> = new EventEmitter<Koppel>();
    @Output() dblClicked: EventEmitter<Koppel> = new EventEmitter<Koppel>();
    aantGespeeld: number = 0;

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
        if (this.pouleKoppel.spelers[0].speler.splMoy > this.pouleKoppel.spelers[1].speler.splMoy) {
            const temp: RondeKoppelSpeler = JSON.parse(JSON.stringify(this.pouleKoppel.spelers[0]));
            this.pouleKoppel.spelers[0] = this.pouleKoppel.spelers[1];
            this.pouleKoppel.spelers[1] = temp;
            const temp2: KoppelSpeler = JSON.parse(JSON.stringify(this.pouleKoppel.koppel.spelers[0]));
            this.pouleKoppel.koppel.spelers[0] = this.pouleKoppel.koppel.spelers[1];
            this.pouleKoppel.koppel.spelers[1] = temp2;
        }
        this.aantGespeeld = 0;
        if (this.pouleKoppel.uitslag.brt > 0) {
            this.pouleKoppel.spelers.forEach(spl => {
                spl.wedstrijden.forEach(wed => {
                    if (wed.uitslag.brt > 0) {
                        this.aantGespeeld++;
                    }
                });
            });
        }
    }
}
