import { Component, inject, OnInit } from '@angular/core';
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
    gewijzigd: boolean = false;
    
    btnSave: Btn = new Btn('save', 'Opslaan');

    opslaanClicked() {
        if (!this.gewijzigd) {
            this.gotoPrevPage();
            return;
        }
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
        this.gewijzigd = this.dagenGewijzigd();
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
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private dagenGewijzigd(): boolean {
        return this.dagen.some((dgNr, idx) => this.koppel.voorkeurDagen[idx] != dgNr);
    }

}
