import { Component, inject, Input } from '@angular/core';
import { DateHelper } from '../../../../services/date-helper';
import { RondeSpeelDag } from '../../../../model/ronde';
import { OvzMatchWide } from '../ovz-match-wide/ovz-match-wide';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-ovz-speeldag-wide',
    imports: [
        OvzMatchWide,
        NgClass
    ],
    templateUrl: './ovz-speeldag-wide.html',
    styleUrl: './ovz-speeldag-wide.css',
})
export class OvzSpeeldagWide {
    dater = inject(DateHelper);
    @Input() type: string = 'pln';
    @Input() dag: RondeSpeelDag = new RondeSpeelDag(0);
    @Input() isFinale: boolean = false;
}
