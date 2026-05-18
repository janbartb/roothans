import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../base/base';
import { Koppel } from '../../../model/koppel';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../model/seizoen';
import { Btn } from '../../../model/misc';
import { Button } from '../../../shared/button/button';
import { KoppelRow } from '../koppel-row/koppel-row';
import { NgClass } from '@angular/common';
import { Speech } from '../../../services/speech';

@Component({
    selector: 'app-koppel-preferences',
    imports: [
        KoppelRow,
        Button,
        NgClass
    ],
    templateUrl: './koppel-preferences.html',
    styleUrl: './koppel-preferences.css',
})
export class KoppelPreferences extends Base implements OnInit {
    route = inject(ActivatedRoute);
    spraak = inject(Speech);
    koppels: Koppel[] = [];
    idxKoppel: number = -1;
    koppel: Koppel = new Koppel();
    config: Seizoen = new Seizoen();
    dagen: number[] = [];
    dagenValid: boolean = true;
    gewijzigd: boolean = false;
    
    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);

    enterPressed() {
        if (this.gewijzigd && this.dagenValid) {
            this.buttonPressed(this.btnSave);
        }
    }

    opslaanClicked() {
        this.koppel.voorkeurDagen = this.dagen;
        this.dao.saveKoppels(this.header.seizoen, this.koppels)
        .then(resp => {
            this.alert.showSuccess(`Koppel '${this.koppel.kopId}' succesvol gewijzigd`);
            this.gotoPrevPage();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    voorkeurDagClicked(idx: number, waarde: number) {
        if (waarde == -1) {
            if (this.dagen.some((vkDag, index) => index > idx && vkDag > -1)) {
                this.spraak.beep();
                return;
            }
        }
        else {
            if (this.dagen.some((vkDag, index) => index < idx && vkDag == -1)) {
                this.spraak.beep();
                return;
            }
            if (this.dagen.some((vkDag, index) => index < idx && vkDag == waarde)) {
                this.spraak.beep();
                return;
            }
        }
        this.dagen[idx] = waarde;
        this.dagenValid = this.dagen[0] > -1 && this.dagen[1] > -1;
        this.gewijzigd = this.dagenGewijzigd();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter' || event.code === 'KeyS') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - koppel voorkeurdata`;

        const id: string | null = this.route.snapshot.paramMap.get('koppelId');
        if (!id) {
            this.alert.showError('Kan koppel ID in URL niet vinden.');
            return;
        }
        Promise.all([
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getSeizoenFile(this.header.seizoen)
        ])
        .then(results => {
            this.koppels = results[0];
            this.config = results[1];
            const kplIdx = this.koppels.findIndex(kpl => kpl.kopId == id);
            if (kplIdx < 0) {
                this.alert.showError(`Koppel met ID '${id}' niet gevonden.`);
                return;
            }
            this.idxKoppel = kplIdx;
            this.koppel = this.koppels[this.idxKoppel];
            this.dagen = this.koppel.voorkeurDagen.filter(dg => true);
            this.header.subtitle = `Seizoen ${this.header.seizoen} - koppel ${id} - Voorkeurdagen`;
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
                if (btn.id == 'save') {
                    this.opslaanClicked();
                }
            }, 250);
        }, 250);
    }

    private dagenGewijzigd(): boolean {
        return this.dagen.some((dgNr, idx) => this.koppel.voorkeurDagen[idx] != dgNr);
    }

}
