import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Btn } from '../../model/misc';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-button',
    imports: [
        NgClass
    ],
    templateUrl: './button.html',
    styleUrl: './button.css',
})
export class Button {
    @Input() button: Btn = new Btn('', '');
    @Input() disabled: boolean = false;
    @Output() btnClicked: EventEmitter<string> = new EventEmitter<string>();

    buttonClicked() {
        if (this.disabled) {
            return;
        }
        this.button.clicked = true;
        setTimeout(() => {
            this.button.clicked = false;
            setTimeout(() => {
                this.btnClicked.emit(this.button.id);
            }, 250);
        }, 250);
    }
}
