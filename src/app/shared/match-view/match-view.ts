import { Component, Input, OnInit } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RondeKoppel } from '../../model/koppel';

@Component({
    selector: 'app-match-view',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './match-view.html',
    styleUrl: './match-view.css',
})
export class MatchView implements OnInit {
    @Input() koppels: RondeKoppel[] = [];
    // @Input() idxSel: number = -1;
    // @Input() idxWedBezig: number = -1;
    // @Output() wedClicked: EventEmitter<number> = new EventEmitter();
    // @Output() error: EventEmitter<string> = new EventEmitter();
    // match: RondeMatch = new RondeMatch(new RondeKoppel(), new RondeKoppel());
    // wedstrijden: RondeWedstrijd[] = [];

    // wedstrijdClicked(idx: number) {
    //     this.wedClicked.emit(idx);
    // }

    ngOnInit(): void {
        // const match = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
        // if (match) {
        //     this.match = match;
        //     this.wedstrijden.push(match.wedstrijden[0]);
        //     this.wedstrijden.push(match.wedstrijden[1]);
        // }
        // else {
        //     this.error.emit(`Match ${this.koppels[0].kopId} - ${this.koppels[1].kopId} niet gevonden.`);
        //     return;
        // }
    }
}
