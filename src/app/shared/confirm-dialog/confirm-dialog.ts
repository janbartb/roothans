import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Btn } from '../../model/misc';
import { Button } from '../button/button';
import { ConfirmDialogType } from '../../model/dialogs';

@Component({
    selector: 'app-confirm-dialog',
    imports: [
        Button
    ],
    templateUrl: './confirm-dialog.html',
    styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
    @Input() dialog: ConfirmDialogType = new ConfirmDialogType('');
    @Input() sure: boolean = false;
    @Output() reply: EventEmitter<boolean> = new EventEmitter<boolean>();
    visible: boolean = false;

    btnConfirm: Btn = new Btn('ja', 'Ja');
    btnCancel: Btn = new Btn('nee', 'Nee');

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.btnConfirm);
            return false;
        }
        if (event.key === 'Escape') {
            this.buttonPressed(this.btnCancel);
            return false;
        }
        return false;
    }

    confirmed() {
        this.reply.emit(true);
    }

    canceled() {
        this.reply.emit(false);
    }

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'ja') {
                    this.confirmed();
                }
                else if (btn.id == 'nee') {
                    this.canceled();
                }
            }, 250);
        }, 250);
    }

}
