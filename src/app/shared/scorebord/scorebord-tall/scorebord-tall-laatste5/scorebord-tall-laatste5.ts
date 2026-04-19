import { Component, Input } from '@angular/core';
import { GetalVar } from '../../../getal-var/getal-var';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-tall-laatste5',
    imports: [
        GetalVar,
        NgClass
    ],
    templateUrl: './scorebord-tall-laatste5.html',
    styleUrl: './scorebord-tall-laatste5.css',
})
export class ScorebordTallLaatste5 {
    @Input() actief: boolean = false;
    @Input() serView: string = '0';
    @Input() serie: number = 0;
    @Input() formatSer: string = '009';
    @Input() laatste5: number[] = [];
    @Input() isVijfde: boolean = false;
    @Input() aantCar: number = 0;
    @Input() metWit: boolean = true;
    @Input() hilite: string = '';
    @Input() position: string = 'left';

}
