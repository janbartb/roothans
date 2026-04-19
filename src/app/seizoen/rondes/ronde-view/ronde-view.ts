import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ronde } from '../../../model/ronde';
import { Button } from '../../../shared/button/button';
import { Btn } from '../../../model/misc';

@Component({
    selector: 'app-ronde-view',
    imports: [
        Button
    ],
    templateUrl: './ronde-view.html',
    styleUrl: './ronde-view.css',
})
export class RondeView {
    @Input() ronde: Ronde = new Ronde(0, '', '', 0, '');
    @Input() prevRonde: Ronde = new Ronde(0, '', '', 0, '');
    @Input() type: string = 'row';
    @Output() planningClicked: EventEmitter<number> = new EventEmitter();
    @Output() spelenClicked: EventEmitter<number> = new EventEmitter();

    btnPlan: Btn = new Btn('plan', 'Planning');
    btnSpel: Btn = new Btn('spel', 'Spelen');

    btnPlanClicked() {
        this.planningClicked.emit(this.ronde.rndId);
    }

    btnSpelClicked() {
        this.spelenClicked.emit(this.ronde.rndId);
    }

}
