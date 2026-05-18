import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../base/base';
import { Koppel } from '../../../model/koppel';
import { KoppelSpeler, Speler } from '../../../model/speler';
import { Btn } from '../../../model/misc';
import { Button } from '../../../shared/button/button';
import { Helper } from '../../../services/helper';
import { DecimalPipe, NgClass } from '@angular/common';
import { KoppelRow } from '../koppel-row/koppel-row';
import { Seizoen } from '../../../model/seizoen';
import { Speech } from '../../../services/speech';

class KoppelItem {
    koppel: Koppel = new Koppel();
    saved: boolean = false;

    constructor(kpl: Koppel, svd?: boolean) {
        this.koppel = kpl;
        this.saved = svd ? true : false;
    }
}

class SpelerItem {
    speler: Speler = new Speler();
    inKoppel: boolean = false;

    constructor(spl: Speler) {
        this.speler = spl;
    }
}

@Component({
    selector: 'app-koppels-toevoegen',
    imports: [
        KoppelRow,
        Button,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './koppels-toevoegen.html',
    styleUrl: './koppels-toevoegen.css',
})
export class KoppelsToevoegen extends Base implements OnInit {
    spraak = inject(Speech);
    helper = inject(Helper);
    config: Seizoen = new Seizoen();
    seizoenen: number[] = [];
    vorigSeizoen: string = '';
    koppelsAdded: Koppel[] = [];
    koppelToAdd: Koppel = new Koppel()
    koppelToAddValid: boolean = false;
    koppelsSaved: Koppel[] = [];
    existingIds: number[] = [];
    maxKoppelsBereikt: boolean = false;
    prevSeizoenKoppels: Koppel[] = [];
    spelers: Speler[] = [];
    spelersInKoppel: Speler[] = [];
    idxKoppelAdded: number = 0;
    idxKoppelSaved: number = 0;
    sortCol: string = 'nam';
    sortDir: number = 1;

    btnOk: Btn = new Btn('ok', 'Ok', 'O', 1);
    btnReset: Btn = new Btn('reset', 'Reset', 'R', 1);

    btnSave: Btn = new Btn('save', 'Toegevoegde koppels opslaan', 's', 23);

    enterPressed() {
        if (this.koppelToAddValid) {
            this.buttonPressed(this.btnOk);
        }
        else if (this.koppelsAdded.length > 0) {
            this.buttonPressed(this.btnSave);
        }
    }

    opslaanClicked() {
        let allKoppels: Koppel[] = [];
        allKoppels.push(...this.koppelsAdded);
        allKoppels.push(...this.koppelsSaved);
        this.dao.saveKoppels(this.header.seizoen, allKoppels)
        .then(resp => {
            this.alert.showSuccess(resp.message);
            this.koppelsSaved = allKoppels;
            this.koppelsAdded = [];
            if (this.koppelsSaved.length == this.config.maxKoppels) {
                this.gotoPrevPage();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    okClicked() {
        if (!this.koppelToAddValid) {
            return;
        }
        this.koppelToAdd.kopId = this.getNewKoppelId();
        if (this.koppelToAdd.kopId == '') {
            this.alert.showError('Kan koppel ID niet aanmaken. Max aantal koppels is 99.');
        }
        else {
            this.koppelsAdded.push(this.koppelToAdd);
            this.koppelToAdd = this.getNewKoppel();
            this.koppelToAddValid = false;
            this.maxKoppelsBereikt = (this.koppelsSaved.length + this.koppelsAdded.length) == this.config.maxKoppels;
        }
    }

    resetClicked() {
        this.koppelToAdd.spelers.forEach(kopSpl => {
            let i = this.spelersInKoppel.findIndex(spl => spl.id == kopSpl.splId);
            if (i >= 0) {
                const speler = this.spelersInKoppel[i];
                this.spelers.push(speler);
                this.spelersInKoppel.splice(i, 1);
            }
        });
        this.sortSpelers(this.sortCol);
        this.koppelToAdd = this.getNewKoppel();
        this.koppelToAddValid = false;
    }

    spelerClicked(idx: number) {
        if (this.maxKoppelsBereikt) {
            return;
        }
        if (this.koppelToAdd.spelers.every(sp => sp.splId != '')) {
            this.alert.showWarning('Er zijn al 2 spelers ingevuld. Klik op [Cancel] om andere spelers te selecteren.');
            return;
        }
        const speler = this.spelers[idx];
        let spl = new KoppelSpeler();
        spl.splId = speler.id;
        spl.splNaam = this.helper.getSpelerNaam(speler);
        spl.splBNaam = speler.vnaam;
        spl.splSnaam = speler.snaam;
        spl.splMoy = speler.moyenne;
        if (this.koppelToAdd.spelers[0].splId == '') {
            this.koppelToAdd.spelers[0] = spl;
        }
        else {
            const splAanw = this.koppelToAdd.spelers[0];
            if (splAanw.splMoy > spl.splMoy) {
                this.koppelToAdd.spelers[1] = splAanw;
                this.koppelToAdd.spelers[0] = spl;
            }
            else {
                this.koppelToAdd.spelers[1] = spl;
            }
        }
        this.koppelToAdd.kopMoyenne = this.getKoppelMoyenne(this.koppelToAdd);
        this.spelersInKoppel.push(speler);
        this.spelers.splice(idx, 1);
        this.checkKoppelToAdd();
    }

    voorkeurDagClicked(idx: number, waarde: number) {
        if (waarde == -1) {
            if (this.koppelToAdd.voorkeurDagen.some((vkDag, index) => index > idx && vkDag > -1)) {
                this.spraak.beep();
                return;
            }
        }
        else {
            if (this.koppelToAdd.voorkeurDagen.some((vkDag, index) => index < idx && vkDag == -1)) {
                this.spraak.beep();
                return;
            }
            if (this.koppelToAdd.voorkeurDagen.some((vkDag, index) => index != idx && vkDag == waarde)) {
                this.spraak.beep();
                return;
            }
        }
        this.koppelToAdd.voorkeurDagen[idx] = waarde;
        this.checkKoppelToAdd();
    }

    koppelAddedClicked(idx: number) {
        let kpl: Koppel = this.koppelsAdded[idx];
        kpl.spelers.forEach(kopSpl => {
            let i = this.spelersInKoppel.findIndex(spl => spl.id == kopSpl.splId);
            if (i >= 0) {
                const speler = this.spelersInKoppel[i];
                this.spelers.push(speler);
                this.spelersInKoppel.splice(i, 1);
            }
        });
        this.sortSpelers(this.sortCol);
        this.removeKoppelIdFromExisting(kpl.kopId);
        this.koppelsAdded.splice(idx, 1);        
    }

    sortClicked(colNaam: string) {
        if (colNaam == this.sortCol) {
            this.sortDir = -1 * this.sortDir;
        }
        else {
            this.sortCol = colNaam;
            this.sortDir = colNaam == 'moy' ? -1 : 1;
        }
        this.sortSpelers(colNaam);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyO') {
            if (this.koppelToAddValid) {
                this.buttonPressed(this.btnOk);
                return false;
            }
            return true;
        }
        if (event.code === 'KeyS') {
            if (this.koppelsAdded.length > 0) {
                this.buttonPressed(this.btnSave);
                return false;
            }
            return true;
        }
        if (event.code === 'KeyR') {
            this.buttonPressed(this.btnReset);
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Koppels toevoegen';

        Promise.all([
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getSpelers(),
            this.dao.getSeizoenFile(this.header.seizoen)
        ])
        .then(results => {
            this.koppelsSaved = results[0];
            this.existingIds = this.koppelsSaved.map(kpl => Number(kpl.kopId.substring(1)));
            this.config = results[2];
            this.maxKoppelsBereikt = this.koppelsSaved.length == this.config.maxKoppels;
            results[1].forEach(spl => {
                if (this.spelerZitAlInKoppel(spl)) {
                    this.spelersInKoppel.push(spl);
                }
                else {
                    this.spelers.push(spl);
                }
            });
            this.sortSpelers(this.sortCol);
            this.koppelToAdd = this.getNewKoppel();
            this.btnSave.default = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'ok') {
                    this.okClicked();
                }
                else if (btn.id == 'reset') {
                    this.resetClicked();
                }
                else if (btn.id == 'save') {
                    this.opslaanClicked();
                }
            }, 250);
        }, 250);
    }

    private checkKoppelToAdd() {
        this.koppelToAddValid = this.koppelToAdd.spelers.every(spl => spl.splId != '') &&
                                this.koppelToAdd.voorkeurDagen[0] > -1 && this.koppelToAdd.voorkeurDagen[1] > -1;
        if (this.koppelToAddValid) {
            this.btnOk.default = true;
            this.btnSave.default = false;
        }
        else {
            this.btnOk.default = false;
            this.btnSave.default = true;
        }
    }

    private spelerZitAlInKoppel(spl: Speler): boolean {
        return this.koppelsSaved.some(kpl => {
            return kpl.spelers.some(kplSpl => kplSpl.splId == spl.id);
        });
    }

    private getNewKoppel(): Koppel {
        let result = new Koppel();
        this.config.speelDagen.forEach(sd => {
            result.voorkeurDagen.push(-1);
        });
        this.btnOk.default = false;
        this.btnSave.default = true;
        return result;
    }

    private getNewKoppelId(): string {
        let idx = 0;
        let found = false;
        while (!found && idx < 99) {
            idx++;
            if (!this.existingIds.includes(idx)) {
                found = true;
            }
        }
        if (found) {
            this.existingIds.push(idx);
            let idxStr = '0' + idx;
            return 'K' + idxStr.substring(idxStr.length - 2);
        }
        return '';
    }

    private removeKoppelIdFromExisting(id: string) {
        const idNr = Number(id.substring(1));
        const idx = this.existingIds.findIndex(nr => nr == idNr);
        if (idx < 0) {
            this.alert.showWarning(`Kan koppel ID '${id}' niet verwijderen. ID niet gevonden.`);
        }
        else {
            this.existingIds.splice(idx, 1);
        }
    }

    private getKoppelMoyenne(koppel: Koppel): number {
        let result = 0;
        if (koppel.spelers[0].splMoy > 0) {
            result = koppel.spelers[0].splMoy;
        }
        if (koppel.spelers[1].splMoy > 0) {
            result = (result + koppel.spelers[1].splMoy) / 2;
        }
        return result;
    }

    private sortSpelers(colNaam: string) {
        if (colNaam == 'nam') {
            this.spelers.sort(this.compareSpelerNaam);
        }
        else {
            this.spelers.sort(this.compareSpelerMoyennes);
        }
    }

    private compareSpelerMoyennes = (a: Speler, b: Speler): number => {
        return this.sortDir * (a.moyenne - b.moyenne);
    }

    private compareSpelerNaam = (a: Speler, b: Speler): number => {
        if (a.vnaam == b.vnaam) {
            return this.sortDir * (a.anaam < b.anaam ? -1 : 1);
        }
        else {
            return this.sortDir * (a.vnaam < b.vnaam ? -1 : 1);
        }
    }

    private compareKoppels(a: Koppel, b: Koppel): number {
        return a.spelers[0].splNaam < b.spelers[0].splNaam ? -1 : 1;
    }

}
