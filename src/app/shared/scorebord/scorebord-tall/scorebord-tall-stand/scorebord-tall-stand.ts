import { Component, input, Input } from '@angular/core';
import { GetalVar } from '../../../getal-var/getal-var';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-tall-stand',
    imports: [
        GetalVar,
        NgClass
    ],
    templateUrl: './scorebord-tall-stand.html',
    styleUrl: './scorebord-tall-stand.css',
})
export class ScorebordTallStand {
    @Input() aantBrt: number = 0;
    @Input() moy: number = 0;
    @Input() aantCar: number = 0;
    @Input() serie: number = 0;
    @Input() enNog: number = 0;
    @Input() moyView: string = '0,000';
    @Input() numFormats: string[] = ['009', '009', '009'];
    @Input() hilite: string = '';
    @Input() position: string = 'left';

}
