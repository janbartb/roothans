import { Component, inject, Input } from '@angular/core';
import { DateHelper } from '../../../../services/date-helper';
import { SpeelDag } from '../../../../model/seizoen';
import { RondeSpeelDag } from '../../../../model/ronde';
import { NgClass } from '@angular/common';
import { OvzMatch } from '../ovz-match/ovz-match';

@Component({
    selector: 'app-ovz-speeldag',
    imports: [
        OvzMatch,
        NgClass
    ],
    templateUrl: './ovz-speeldag.html',
    styleUrl: './ovz-speeldag.css',
})
export class OvzSpeeldag {
    dater = inject(DateHelper);
    @Input() type: string = 'pln';
    @Input() dag: RondeSpeelDag = new RondeSpeelDag(0);
}
