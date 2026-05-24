import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Poule } from '../../../model/ronde';
import { RondeKoppelView } from '../../koppels/ronde-koppel-view/ronde-koppel-view';

@Component({
    selector: 'app-ronde-poule-view',
    imports: [
        RondeKoppelView,
        NgClass
    ],
    templateUrl: './ronde-poule-view.html',
    styleUrl: './ronde-poule-view.css',
})
export class RondePouleView implements OnInit {
    @Input() poule: Poule = new Poule(0);
    @Input() type: string = '';
    @Input() selected: boolean = false;
    @Input() idxKoppel: number = -1;
    @Input() maxKoppels: number = 4;
    @Input() koppelView: string = 'poule';
    @Input() koppelClick: boolean = true;
    @Input() koppelSelect: boolean = false;
    @Input() pouleCheck: boolean = false;
    @Input() allowDelete: boolean = true;
    @Output() koppelClicked: EventEmitter<number> = new EventEmitter<number>();
    @Output() deletePouleClicked: EventEmitter<string> = new EventEmitter<string>();
    pouleGestart: boolean = false;

    kplClicked(idx: number) {
        if (this.koppelSelect) {
            this.idxKoppel = idx;
        }
        this.koppelClicked.emit(idx);
    }

    deleteClicked(event: MouseEvent) {
        event.stopPropagation();
        this.deletePouleClicked.emit(this.poule.id);
    }

    dateReverse(dat: string): string {
        if (!dat || dat == '') {
            return '';
        }
        return `${dat.substring(8)}-${dat.substring(5,7)}-${dat.substring(0,4)}`;
    }

    ngOnInit(): void {
        this.pouleGestart = this.poule.koppels.some(pk => pk.uitslag.brt > 0);
    }

}
