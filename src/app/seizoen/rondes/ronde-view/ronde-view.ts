import { Component, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { Ronde } from '../../../model/ronde';
import { NgClass } from '@angular/common';
import { DateHelper } from '../../../services/date-helper';

@Component({
    selector: 'app-ronde-view',
    imports: [
        NgClass
    ],
    templateUrl: './ronde-view.html',
    styleUrl: './ronde-view.css',
})
export class RondeView {
    dater = inject(DateHelper);
    btnPressed = input('');
    @Input() ronde: Ronde = new Ronde(0, '', '', 0, '');
    @Input() type: string = 'row';
    @Input() selected: boolean = false;
    @Output() clicked: EventEmitter<number> = new EventEmitter();

    rondeClicked() {
        this.clicked.emit(this.ronde.rndId - 1);
    }
}
