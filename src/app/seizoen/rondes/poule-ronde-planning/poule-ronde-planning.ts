import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../base/base';
import { Poule, PouleKoppel, PouleRonde, Ronde } from '../../../model/ronde';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../model/seizoen';
import { Koppel } from '../../../model/koppel';
import { KoppelRow } from '../../koppels/koppel-row/koppel-row';
import { NgClass } from '@angular/common';
import { RondePouleView } from '../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../shared/button/button';
import { Btn } from '../../../model/misc';

class KoppelsPerDag {
    dagNr: number = 0;
    dagNaam: string = '';
    koppelsFirst: Koppel[] = [];
    koppelsSecond: Koppel[] = [];
    koppelsRest: Koppel[] = [];
    idxFirst: number = -1;
    idxSecond: number = -1;
    idxRest: number = -1;
}

@Component({
    selector: 'app-poule-ronde-planning',
    imports: [
        KoppelRow,
        RondePouleView,
        Button,
        NgClass
    ],
    templateUrl: './poule-ronde-planning.html',
    styleUrl: './poule-ronde-planning.css',
})
export class PouleRondePlanning extends Base implements OnInit {
    route = inject(ActivatedRoute);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    koppels: Koppel[] = [];
    koppelsPerDagen: KoppelsPerDag[] = [];
    pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    maxPoules: number = 0;
    maxWeekdagen: number = 4;  // geeft aan hoeveel maandagen, dinsdagen enz beschikbaar zijn voor de poule ronde
    touched: boolean = false;
    poulesOk: boolean = false;

    btnSave: Btn = new Btn('save', 'Opslaan');
    btnSaveNext: Btn = new Btn('savenext', 'Opslaan en naar speeldata');
    btnNext: Btn = new Btn('next', 'Naar speeldata');

    opslaanClicked(andNext?: boolean) {
        this.dao.savePouleRondeFile(this.header.seizoen, this.ronde.fileNaam, this.pouleRonde)
        .then(resp => {
            this.alert.showSuccess(resp.message);
            this.touched = false;
            if (andNext) {
                this.nextClicked();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    nextClicked() {
        this.gotoPage(`rondes/poule/${this.ronde.rndId}/data`, `rondes/poule/${this.ronde.rndId}`);
    }

    koppelHovered(koppel: Koppel) {
        this.koppelsPerDagen.forEach(kpd => {
            kpd.idxFirst = kpd.koppelsFirst.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxSecond = kpd.koppelsSecond.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxRest = kpd.koppelsRest.findIndex(kop => kop.kopId == koppel.kopId);
        });
    }

    koppelClicked(koppel: Koppel, kpd: KoppelsPerDag) {
        let allDagPoules = this.pouleRonde.poules.filter(pl => pl.pouleDagNr == -1 || pl.pouleDagNr == kpd.dagNr);
        let availDagPoule = allDagPoules.find(pl => pl.pouleKoppels.length < this.config.maxKoppelsPerPoule);
        if (availDagPoule) {
            this.addKoppelToPoule(availDagPoule, koppel, kpd);
        }
        else {
            if (this.pouleRonde.poules.length == this.maxPoules || allDagPoules.length == this.maxWeekdagen) {
                this.alert.showWarning(`Er kan geen nieuwe poule voor ${kpd.dagNaam} worden aangemaakt`);
                return;
            }
            availDagPoule = new Poule();
            availDagPoule.pouleId = String.fromCharCode(65 + this.pouleRonde.poules.length);
            this.pouleRonde.poules.push(availDagPoule);
            this.addKoppelToPoule(availDagPoule, koppel, kpd);
        }
    }

    removeKoppelFromPoule(idxPoule: number, idxKoppel: number) {
        const poule = this.pouleRonde.poules[idxPoule];
        const koppelToRemove = poule.pouleKoppels[idxKoppel];
        this.pouleKoppelBackToKoppelsPerDagen(koppelToRemove.koppel);
        poule.pouleKoppels.splice(idxKoppel, 1);
        if (!poule.pouleKoppels.length) {
            poule.pouleDagNr = -1;
            poule.pouleDagNaam = '';
        }
        this.touched = true;
        this.poulesOk = false;
    }

    removePoule(idx: number) {
        this.pouleRonde.poules[idx].pouleKoppels.forEach((kpl) => {
            this.pouleKoppelBackToKoppelsPerDagen(kpl.koppel);
        });
        this.pouleRonde.poules.splice(idx, 1);
        this.renamePoules();
        this.touched = true;
        this.poulesOk = false;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning`;

        const rondeId: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!rondeId) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const id = Number(rondeId);
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getKoppels(this.header.seizoen)
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            this.koppels = results[2];
            this.koppels.sort(this.compareKoppels);
            const idx = this.rondes.findIndex(rnd => rnd.rndId == id);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning ${this.ronde.rndNaam} - Poules aanmaken`;
            this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.fillKoppelsPerDagen();
                if (!this.pouleRonde.poules) {
                    this.pouleRonde.poules = [];
                }
                this.pouleRonde.poules.forEach(poule => {
                    poule.pouleKoppels.forEach(pkop => {
                        this.removeKoppelFromKoppelsPerDagen(pkop.koppel);
                    });
                });
                this.maxPoules = this.config.maxKoppels / this.config.maxKoppelsPerPoule;
                this.poulesOk = this.allPoulesFilled();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private addKoppelToPoule(poule: Poule, koppel: Koppel, kpd: KoppelsPerDag) {
        if (!poule.pouleKoppels.length) {
            poule.pouleDagNr = kpd.dagNr;
            poule.pouleDagNaam = kpd.dagNaam;
        }
        poule.pouleKoppels.push(new PouleKoppel(koppel));
        poule.pouleKoppels.sort(this.comparePoulKoppels);
        this.removeKoppelFromKoppelsPerDagen(koppel);
        this.touched = true;
        this.poulesOk = this.allPoulesFilled();
    }

    private allPoulesFilled(): boolean {
        return this.pouleRonde.poules.length == this.maxPoules &&
                this.pouleRonde.poules.every(pl => pl.pouleKoppels.length == this.config.maxKoppelsPerPoule);
    }

    private removeKoppelFromKoppelsPerDagen(koppel: Koppel) {
        this.koppelsPerDagen.forEach(kpd => {
            kpd.idxFirst = -1;
            kpd.idxSecond = -1;
            kpd.idxRest = -1;
            kpd.koppelsFirst = kpd.koppelsFirst.filter(kp => kp.kopId != koppel.kopId);
            kpd.koppelsSecond = kpd.koppelsSecond.filter(kp => kp.kopId != koppel.kopId);
            kpd.koppelsRest = kpd.koppelsRest.filter(kp => kp.kopId != koppel.kopId);
        });
    }

    private fillKoppelsPerDagen() {
        this.config.speelDagen.forEach((sdag) => {
            let kpd = new KoppelsPerDag();
            kpd.dagNr = sdag.dagNr;
            kpd.dagNaam = sdag.dagNaam;
            this.koppels.forEach(koppel => {
                if (koppel.voorkeurDagen.includes(kpd.dagNr)) {
                    if (koppel.voorkeurDagen[0] == kpd.dagNr) {
                        kpd.koppelsFirst.push(koppel);
                    }
                    else if (koppel.voorkeurDagen[1] == kpd.dagNr) {
                        kpd.koppelsSecond.push(koppel);
                    }
                    else {
                        kpd.koppelsRest.push(koppel);
                    }
                }
            });
            this.koppelsPerDagen.push(kpd);
        });
    }

    private pouleKoppelBackToKoppelsPerDagen(koppel: Koppel) {
        this.koppelsPerDagen.forEach(kpd => {
            if (koppel.voorkeurDagen.includes(kpd.dagNr)) {
                if (koppel.voorkeurDagen[0] == kpd.dagNr) {
                    kpd.koppelsFirst.push(koppel);
                    kpd.koppelsFirst.sort(this.compareKoppels);
                }
                else if (koppel.voorkeurDagen[1] == kpd.dagNr) {
                    kpd.koppelsSecond.push(koppel);
                    kpd.koppelsSecond.sort(this.compareKoppels);
                }
                else {
                    kpd.koppelsRest.push(koppel);
                    kpd.koppelsRest.sort(this.compareKoppels);
                }
            }
        });
    }

    private renamePoules() {
        this.pouleRonde.poules.forEach((poule, idx) => {
            poule.pouleId = String.fromCharCode(65 + idx);
        });
    }

    private compareKoppels(a: Koppel, b: Koppel): number {
        return b.kopMoyenne - a.kopMoyenne;
    }

    private comparePoulKoppels(a: PouleKoppel, b: PouleKoppel): number {
        return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
    }

}
