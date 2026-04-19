import { Component, Input } from '@angular/core';
import { ModalMessage } from '../../../model/modal-message';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-notification',
    imports: [
        NgClass
    ],
    templateUrl: './notification.html',
    styleUrl: './notification.css',
})
export class Notification {
    @Input() modal: ModalMessage = new ModalMessage('', [], '', 0);
    @Input() type: string = 'vertical';
    @Input() kleur: string = 'white';
    @Input() spel: string = '';

}
