import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AfvalDag } from '../../../../model/ronde';
import { DateHelper } from '../../../../services/date-helper';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-speeldag-view',
    imports: [
        FormsModule,
        NgClass
    ],
    templateUrl: './speeldag-view.html',
    styleUrl: './speeldag-view.css',
})
export class SpeeldagView {
    dater = inject(DateHelper);
    @Input() speelDag: AfvalDag = new AfvalDag(0);
    @Input() viewType: string = 'row';
    @Input() selected: boolean = false;
    @Input() idxMatch: number = -1;
    @Output() dateChanged: EventEmitter<string> = new EventEmitter();
    @Output() select: EventEmitter<boolean> = new EventEmitter();
    @Output() matchClick: EventEmitter<number> = new EventEmitter();
    @Output() delete: EventEmitter<boolean> = new EventEmitter();
    nbs = String.fromCharCode(160);

    datumGewijzigd() {
        this.dateChanged.emit(this.speelDag.dagDatum);
    }

    dagClicked() {
        this.select.emit(true);
    }

    matchClicked(idx: number) {
        this.matchClick.emit(idx);
    }

    verwijderenClicked() {
        this.delete.emit(true);
    }

}
