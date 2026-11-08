import { Component, inject, Input } from '@angular/core';
import { DateHelper } from '../../../../services/date-helper';
import { Poule } from '../../../../model/ronde';

@Component({
    selector: 'app-ovz-poule',
    imports: [],
    templateUrl: './ovz-poule.html',
    styleUrl: './ovz-poule.css',
})
export class OvzPoule {
    dater = inject(DateHelper);
    @Input() type: string = 'pln';
    @Input() poule: Poule = new Poule(0);
}
