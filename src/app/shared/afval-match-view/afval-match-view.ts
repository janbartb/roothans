import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RondeKoppel } from '../../model/koppel';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-afval-match-view',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './afval-match-view.html',
    styleUrl: './afval-match-view.css',
})
export class AfvalMatchView {
    @Input() koppels: RondeKoppel[] = [];
    @Input() isPouleMatch: boolean = false;
    @Input() idxSel: number = -1;
    @Input() idxWedBezig: number = -1;
    @Input() beurten: number = 20;
    @Output() wedClicked: EventEmitter<number> = new EventEmitter();
    @Output() keyboardClicked: EventEmitter<number> = new EventEmitter();
    @Output() error: EventEmitter<string> = new EventEmitter();

    wedstrijdClicked(idx: number) {
        this.wedClicked.emit(idx);
    }

    keybClicked(event: MouseEvent, idx: number) {
        event.stopPropagation();
        this.keyboardClicked.emit(idx);
    }

}
