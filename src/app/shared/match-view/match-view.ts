import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { KoppelMatch, RondeKoppel } from '../../model/koppel';
import { RondeMatch } from '../../model/ronde';

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
    @Input() isPouleMatch: boolean = false;
    @Input() idxSel: number = -1;
    @Input() idxWedBezig: number = -1;
    @Output() wedClicked: EventEmitter<number> = new EventEmitter();
    @Output() keyboardClicked: EventEmitter<number> = new EventEmitter();
    @Output() error: EventEmitter<string> = new EventEmitter();
    matches: KoppelMatch[] = [];

    wedstrijdClicked(idx: number) {
        this.wedClicked.emit(idx);
    }

    keybClicked(event: MouseEvent, idx: number) {
        event.stopPropagation();
        this.keyboardClicked.emit(idx);
    }

    ngOnInit(): void {
        let mat = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
        if (mat) {
            this.matches.push(mat);
        }
        else {
            this.matches.push(new KoppelMatch(new RondeKoppel(), new RondeKoppel()));
        }
        mat = this.koppels[1].matches.find(m => m.tegKoppelId == this.koppels[0].kopId);
        if (mat) {
            this.matches.push(mat);
        }
        else {
            this.matches.push(new KoppelMatch(new RondeKoppel(), new RondeKoppel()));
        }
    }
}
