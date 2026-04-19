import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Btn } from '../../model/misc';
import { Button } from '../button/button';

@Component({
    selector: 'app-confirm-dialog',
    imports: [
        Button
    ],
    templateUrl: './confirm-dialog.html',
    styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
    @Input() title: string = '';
    @Input() texts: string[] = [];
    @Output() reply: EventEmitter<boolean> = new EventEmitter<boolean>();

    btnConfirm: Btn = new Btn('ja', 'Ja');
    btnCancel: Btn = new Btn('nee', 'Nee');

    confirmed() {
        this.reply.emit(true);
    }

    canceled() {
        this.reply.emit(false);
    }

}
