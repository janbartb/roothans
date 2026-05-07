import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { Speler } from '../../model/speler';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { greaterZero, notEmpty } from '../../directives/validators';
import { NgClass } from '@angular/common';
import { Btn } from '../../model/misc';
import { Button } from "../../shared/button/button";
import { Speech } from '../../services/speech';

@Component({
    selector: 'app-speler-dialog',
    imports: [
        ReactiveFormsModule,
        NgClass,
        Button
    ],
    templateUrl: './speler-dialog.html',
    styleUrl: './speler-dialog.css',
})
export class SpelerDialog implements OnInit {
    fb = inject(FormBuilder);
    speech = inject(Speech);
    @Input() speler: Speler = new Speler();
    @Input() title: string = 'Speler toevoegen';
    @Input() action: string = 'add';
    @Input() existing: string[] = [];
    @Output() confirm: EventEmitter<Speler> = new EventEmitter<Speler>();
    @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();

    btnConfirm: Btn = new Btn('ok', 'Opslaan');
    btnCancel: Btn = new Btn('cancel', 'Annuleer');

    spelerForm!: FormGroup;

    confirmed() {
        Object.assign(this.speler, this.spelerForm.value);
        this.confirm.emit(this.speler);
    }

    canceled() {
        this.cancel.emit(true);
    }

    voornaamBlurred() {
        this.vnaam?.setValue(this.vnaam.value.trim());
        if (this.snaam?.value == '') {
            this.snaam.setValue(this.vnaam?.value);
        }
    }

    naamUitspreken() {
        console.log(`Uitspreken: ${this.snaam?.value}`);
        this.speech.speak(this.snaam?.value, true);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.spelerForm && this.spelerForm.valid) {
                this.buttonPressed(this.btnConfirm);
                return false;
            }
            return true;
        }
        if (event.key === 'Escape') {
            this.buttonPressed(this.btnCancel);
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.createSpelerForm();
    }

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'ok') {
                    this.confirmed();
                }
                if (btn.id == 'cancel') {
                    this.canceled();
                }
            }, 250);
        }, 250);
    }

    private createSpelerForm() {
        this.spelerForm =  this.fb.nonNullable.group({
            vnaam: [this.speler.vnaam, [Validators.required, notEmpty()]],
            tvoeg: [this.speler.tvoeg],
            anaam: [this.speler.anaam, [Validators.required, notEmpty()]],
            extra: [this.speler.extra],
            snaam: [this.speler.snaam, [Validators.required, notEmpty()]],
            moyenne: [this.speler.moyenne, [greaterZero()]],
            email: [this.speler.email, [Validators.email]]
        });
        if (this.action == 'edit') {
            this.spelerForm.get('id')?.disable();
        }
    }

    get vnaam() {
        return this.spelerForm?.get('vnaam');
    }
    get tvoeg() {
        return this.spelerForm?.get('tvoeg');
    }
    get anaam() {
        return this.spelerForm?.get('anaam');
    }
    get extra() {
        return this.spelerForm?.get('extra');
    }
    get snaam() {
        return this.spelerForm?.get('snaam');
    }
    get moyenne() {
        return this.spelerForm?.get('moyenne');
    }
    get email() {
        return this.spelerForm?.get('email');
    }

}
