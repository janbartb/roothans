import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Koppel } from '../../../model/koppel';
import { KoppelSpeler } from '../../../model/speler';
import { DecimalPipe, NgClass } from '@angular/common';
import { SpeelDag } from '../../../model/seizoen';
import { PouleKoppel } from '../../../model/ronde';

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
    @Input() pouleKoppel: PouleKoppel = new PouleKoppel(new Koppel());
    @Input() rang: number = 0;
    @Input() view: string = 'normal';
    @Input() speelDagen: SpeelDag[] = [];
    @Input() selectable: boolean = true;
    @Output() hovered: EventEmitter<Koppel> = new EventEmitter<Koppel>();
    @Output() clicked: EventEmitter<Koppel> = new EventEmitter<Koppel>();
    @Output() dblClicked: EventEmitter<Koppel> = new EventEmitter<Koppel>();
    //@Output() dagClicked: EventEmitter<Koppel> = new EventEmitter<Koppel>();

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
    }
}
