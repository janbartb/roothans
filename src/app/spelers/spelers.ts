import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../base/base';
import { Speler } from '../model/speler';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Button } from '../shared/button/button';
import { Btn } from '../model/misc';
import { SpelerDialog } from "./speler-dialog/speler-dialog";
import { Helper } from '../services/helper';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { Speech } from '../services/speech';
import { ConfirmDialogType } from '../model/dialogs';

@Component({
    selector: 'app-spelers',
    imports: [
        ReactiveFormsModule,
        Button,
        DecimalPipe,
        NgClass,
        SpelerDialog,
        ConfirmDialog
    ],
    templateUrl: './spelers.html',
    styleUrl: './spelers.css',
})
export class Spelers extends Base implements OnInit {
    fb = inject(FormBuilder);
    helper = inject(Helper);
    speech = inject(Speech);
    spelers: Speler[] = [];
    idxSpeler: number = -1;
    idxToDelete: number = -1;
    sortCol: string = '';
    sortDir: number = 1;
    existingIds: string[] = [];
    speler: Speler = new Speler();
    mode: string = 'edit';
    confirmDeleteDialog: ConfirmDialogType = new ConfirmDialogType('Speler verwijderen');

    btnAdd: Btn = new Btn('add', 'Toevoegen speler', 'T', 1);

    toevoegenClicked() {
        this.mode = 'add';
        this.dialogTitle = 'Speler toevoegen';
        this.speler = new Speler();
        this.idxSpeler = -1;
        this.dialogVisible = true;
    }

    spelerClicked(idx: number) {
        this.idxSpeler = idx;
        if (this.idxSpeler >= 0) {
            this.mode = 'edit';
            this.dialogTitle = 'Speler wijzigen';
            this.speler = this.spelers[this.idxSpeler];
            this.dialogVisible = true;
        }
    }

    deleteSpelerClicked(event: MouseEvent, idx: number) {
        event.stopPropagation();
        this.idxSpeler = idx;
        this.idxToDelete = idx;
        const splToDelete = this.spelers[idx];
        this.confirmDeleteDialog.texts = [`Speler ${this.helper.getSpelerNaam(splToDelete)} verwijderen.`];
        this.confirmDeleteDialog.open = true;
    }

    deleteSpelerReplied(confirmed: boolean) {
        if (!confirmed) {
            this.idxSpeler = -1;
            this.confirmDeleteDialog.open = false;
            return;
        }
        const splToDelete = this.spelers[this.idxToDelete];
        this.dao.deleteSpeler(splToDelete)
        .then(resp => {
            this.alert.showSuccess(`Speler ${this.helper.getSpelerNaam(splToDelete)} succesvol verwijderd.`);
            this.idxSpeler = -1;
            this.spelers.splice(this.idxToDelete, 1);
        })
        .catch(err => {
            this.alert.showError(err);
        });
        this.confirmDeleteDialog.open = false;
    }

    naamUitspreken(event: MouseEvent, idx: number) {
        event.stopPropagation();
        this.speech.speak(this.spelers[idx].snaam);
    }

    sortClicked(colNaam: string) {
        if (colNaam == this.sortCol) {
            this.sortDir = -1 * this.sortDir;
        }
        else {
            this.sortCol = colNaam;
            this.sortDir = colNaam == 'moy' ? -1 : 1;
        }
        this.idxSpeler = -1;
        this.sortSpelers(colNaam);
    }

    dialogConfirmed(spl: Speler) {
        if (this.mode == 'add') {
            spl.id = this.helper.createSpelerId(spl, this.existingIds);
            this.dao.addSpelers([spl])
            .then(resp => {
                this.alert.showSuccess(`Speler ${this.helper.getSpelerNaam(spl)} succesvol toegevoegd`);
                this.existingIds.push(spl.id);
                this.spelers.push(spl);
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            this.dao.updateSpeler(spl)
            .then(resp => {
                this.alert.showSuccess(`Speler ${this.helper.getSpelerNaam(spl)} succesvol gewijzigd`);
                const idx = this.spelers.findIndex(sp => sp.id == spl.id);
                if (idx >= 0) {
                    this.spelers[idx] = spl;
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });

        }
        this.dialogVisible = false;
    }

    dialogCanceled() {
        this.idxSpeler = -1;
        this.dialogVisible = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.dialogVisible || this.confirmDeleteDialog.open) {
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyT') {
            this.buttonPressed(this.btnAdd);
            return false;
        }
        if (event.key === 'Home') {
            this.gotoHome();
            return false;
        }
        return true;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'Onderhoud spelers';
        this.dao.getSpelers()
        .then(result => {
            this.spelers = result;
            this.existingIds = this.spelers.map(spl => spl.id);
            this.sortCol = 'moy';
            this.sortDir = -1;
            this.sortSpelers('moy');
            this.header.subtitle += ` (${this.spelers.length})`
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'add') {
                    this.toevoegenClicked();
                }
            }, 250);
        }, 250);
    }

    private sortSpelers(colNaam: string) {
        if (colNaam == 'nam') {
            this.spelers.sort(this.compareNames);
        }
        else {
            this.spelers.sort(this.compareMoyennes);
        }
    }

    private compareNames = (a: Speler, b: Speler): number => {
        if (a.vnaam == b.vnaam) {
            if (a.tvoeg == b.tvoeg) {
                return this.sortDir * (a.anaam < b.anaam ? -1 : 1);
            }
            else {
                return this.sortDir * (a.tvoeg < b.tvoeg ? -1 : 1);
            }
        }
        else {
            return this.sortDir * (a.vnaam < b.vnaam ? -1 : 1);
        }
    }
    
    private compareMoyennes = (a: Speler, b: Speler): number => {
        return this.sortDir * (a.moyenne - b.moyenne);
    }
    
}
