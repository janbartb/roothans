import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-scorebord-tall-bal',
    imports: [
        NgClass
    ],
    templateUrl: './scorebord-tall-bal.html',
    styleUrl: './scorebord-tall-bal.css',
})
export class ScorebordTallBal {
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;
    @Input() hilite: string = '';
}
