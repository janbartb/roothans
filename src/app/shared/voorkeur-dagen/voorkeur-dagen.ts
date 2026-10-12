import { NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Seizoen } from '../../model/seizoen';
import { Speech } from '../../services/speech';

@Component({
    selector: 'app-voorkeur-dagen',
    imports: [
        NgClass
    ],
    templateUrl: './voorkeur-dagen.html',
    styleUrl: './voorkeur-dagen.css',
})
export class VoorkeurDagen {
    spraak = inject(Speech);
    @Input() config: Seizoen = new Seizoen();
    @Input() dagen: number[] = [];
    @Input() dagIngepland: number = -2;
    @Output() dagClicked: EventEmitter<number[]> = new EventEmitter();

    voorkeurDagClicked(idx: number, waarde: number) {
        if (this.dagen[idx] == this.dagIngepland && waarde != this.dagIngepland) {
            this.spraak.beep();
            return;
        }
        if (waarde == -1) {
            if (this.dagen.some((vkDag, index) => index > idx && vkDag > -1)) {
                this.spraak.beep();
                return;
            }
        }
        else {
            if (this.dagen.some((vkDag, index) => index < idx && vkDag == -1)) {
                this.spraak.beep();
                return;
            }
            if (this.dagen.some((vkDag, index) => index < idx && vkDag == waarde)) {
                this.spraak.beep();
                return;
            }
        }
        this.dagen[idx] = waarde;
        this.dagClicked.emit(this.dagen);
        // this.dagenValid = this.dagen[0] > -1 && this.dagen[1] > -1;
        // this.gewijzigd = this.dagenGewijzigd();
    }
}
