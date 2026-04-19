import { Component, OnInit, ChangeDetectionStrategy, model, inject } from '@angular/core';
import { Base } from '../base/base';
import { DateHelper } from '../services/date-helper';

@Component({
    selector: 'app-probeer',
    templateUrl: './probeer.html',
    imports: [],
    styleUrl: './probeer.css'
})
export class Probeer extends Base implements OnInit {
    dater = inject(DateHelper);

    

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'Probeer scherm';
        this.dater.getAllWeekDaysOfMonth(2026, 0, 1);
    }
}
