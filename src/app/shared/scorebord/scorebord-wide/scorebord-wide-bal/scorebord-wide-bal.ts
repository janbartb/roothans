import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-scorebord-wide-bal',
    imports: [
        NgClass
    ],
    templateUrl: './scorebord-wide-bal.html',
    styleUrl: './scorebord-wide-bal.css',
})
export class ScorebordWideBal {
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;

}
