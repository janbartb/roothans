import { Component, Input } from '@angular/core';
import { GetalVar } from '../../../getal-var/getal-var';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-wide-stand',
    imports: [
        GetalVar,
        NgClass
    ],
    templateUrl: './scorebord-wide-stand.html',
    styleUrl: './scorebord-wide-stand.css',
})
export class ScorebordWideStand {
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;
    @Input() serie: number = 0;
    @Input() enNog: number = 0;
    @Input() moyView: string = '0,000';
    @Input() numFormats: string[] = ['009', '009', '009'];
    @Input() position: string = 'left';

}
