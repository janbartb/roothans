import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-scorebord-tall-status',
    imports: [],
    templateUrl: './scorebord-tall-status.html',
    styleUrl: './scorebord-tall-status.css',
})
export class ScorebordTallStatus {
    @Input() beurten: number = 0;
    @Input() aantCar: number = 0;
    @Input() serie: number = 0;
    @Input() voortgang: number = 0;
    @Input() position: string = 'left';
}
