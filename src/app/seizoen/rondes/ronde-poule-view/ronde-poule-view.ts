import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KoppelRow } from '../../koppels/koppel-row/koppel-row';
import { NgClass } from '@angular/common';
import { Poule } from '../../../model/ronde';

@Component({
    selector: 'app-ronde-poule-view',
    imports: [
        KoppelRow,
        NgClass
    ],
    templateUrl: './ronde-poule-view.html',
    styleUrl: './ronde-poule-view.css',
})
export class RondePouleView {
    @Input() poule: Poule = new Poule();
    @Input() idxKoppel: number = -1;
    @Input() maxKoppels: number = 4;
    @Input() koppelView: string = 'poule';
    @Input() koppelClick: boolean = true;
    @Input() koppelSelect: boolean = false;
    @Input() pouleCheck: boolean = false;
    @Input() allowDelete: boolean = true;
    @Output() koppelClicked: EventEmitter<number> = new EventEmitter<number>();
    @Output() deletePouleClicked: EventEmitter<string> = new EventEmitter<string>();

    kplClicked(idx: number) {
        if (this.koppelSelect) {
            this.idxKoppel = idx;
        }
        this.koppelClicked.emit(idx);
    }

    deleteClicked(event: MouseEvent) {
        event.stopPropagation();
        this.deletePouleClicked.emit(this.poule.pouleId);
    }

    dateReverse(dat: string): string {
        if (!dat || dat == '') {
            return '';
        }
        return `${dat.substring(8)}-${dat.substring(5,7)}-${dat.substring(0,4)}`;
    }

}
