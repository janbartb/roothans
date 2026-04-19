import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-scorebord-wide-status',
    imports: [],
    templateUrl: './scorebord-wide-status.html',
    styleUrl: './scorebord-wide-status.css',
})
export class ScorebordWideStatus {
    @Input() aantCar: number = 0;
    @Input() serie: number = 0;
    @Input() voortgang: number = 0;

}
