import { Component, Input } from '@angular/core';
import { GetalVar } from '../../../getal-var/getal-var';

@Component({
    selector: 'app-scorebord-wide-extra',
    imports: [
        GetalVar
    ],
    templateUrl: './scorebord-wide-extra.html',
    styleUrl: './scorebord-wide-extra.css',
})
export class ScorebordWideExtra {
    @Input() serie: number = 0;
    @Input() hoogSer: number = 0;
    @Input() punten: number = 0;
    @Input() perc: number = 0;
    @Input() percView: string = '0,00';
    @Input() formatSer: string = '009';

}
