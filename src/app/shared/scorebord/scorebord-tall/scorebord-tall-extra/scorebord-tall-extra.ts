import { Component, input, Input } from '@angular/core';
import { GetalVar } from '../../../getal-var/getal-var';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-tall-extra',
    imports: [
        GetalVar,
        NgClass
    ],
    templateUrl: './scorebord-tall-extra.html',
    styleUrl: './scorebord-tall-extra.css',
})
export class ScorebordTallExtra {
    @Input() serie: number = 0;
    @Input() hoogSer: number = 0;
    @Input() punten: number = 0;
    @Input() oldPunten: number = 0;
    @Input() perc: number = 0;
    @Input() percView: string = '0,00';
    @Input() formatSer: string = '009';
    @Input() hilite: string = '';
    @Input() position: string = 'left';

}
