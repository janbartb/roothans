import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-scorebord-tall-status',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './scorebord-tall-status.html',
    styleUrl: './scorebord-tall-status.css',
})
export class ScorebordTallStatus {
    @Input() aantCar: number = 0;
    @Input() serie: number = 0;
    @Input() voortgang: number = 0;
    @Input() teamAantCar: number = 0;
    @Input() teamTsCar: number = 0;
    @Input() teamMaxCar: number = 0;
    @Input() position: string = 'left';
    @Input() hilite: string = '';

}
