import { Component, Input } from '@angular/core';
import { ScorebordTallBal } from '../scorebord-tall-bal/scorebord-tall-bal';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-scorebord-tall-info',
    imports: [
        ScorebordTallBal,
        DecimalPipe
    ],
    templateUrl: './scorebord-tall-info.html',
    styleUrl: './scorebord-tall-info.css',
})
export class ScorebordTallInfo {
    @Input() naam: string = '';
    @Input() koppelId: string = '';
    @Input() moyenne: number = 0;
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;
    @Input() position: string = 'left';
    @Input() hilite: string = '';
}
