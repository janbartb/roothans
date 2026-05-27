import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Koppel, KoppelMatch, RondeKoppel } from '../../../../../model/koppel';
import { RondePouleView } from '../../../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../../../shared/button/button';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { Btn } from '../../../../../model/misc';
import { Base } from '../../../../../base/base';
import { RondeKoppelView } from '../../../../koppels/ronde-koppel-view/ronde-koppel-view';

class KoppelsPerDag {
    dagNr: number = 0;
    dagNaam: string = '';
    koppelsFirst: RondeKoppel[] = [];
    koppelsSecond: RondeKoppel[] = [];
    koppelsRest: RondeKoppel[] = [];
    idxFirst: number = -1;
    idxSecond: number = -1;
    idxRest: number = -1;
}

interface IData {
    [ key: string ]: any;
}

@Component({
    selector: 'app-poules-aanmaken',
    imports: [
        RondeKoppelView,
        RondePouleView,
        Button,
        NgClass
    ],
    templateUrl: './poules-aanmaken.html',
    styleUrl: './poules-aanmaken.css',
})
export class PoulesAanmaken extends Base implements OnInit {
    route = inject(ActivatedRoute);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    koppels: Koppel[] = [];
    koppelsPerDagen: KoppelsPerDag[] = [];
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    existingKoppelIds: string[] = [];
    maxPoules: number = 0;
    maxWeekdagen: number = 4;  // geeft aan hoeveel maandagen, dinsdagen enz beschikbaar zijn voor de poule ronde
    touched: boolean = false;
    poulesOk: boolean = false;
    matchToNrs: IData = {
        m01 : 1,
        m10 : 1,
        m23 : 2,
        m32 : 2,
        m02 : 3,
        m20 : 3,
        m13 : 4,
        m31 : 4,
        m03 : 5,
        m30 : 5,
        m12 : 6,
        m21 : 6
    };

    btnSaveDef: Btn = new Btn('savedef', 'Opslaan', 'enter');
    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);
    btnSaveNext: Btn = new Btn('savenext', 'Opslaan en naar speeldata');
    btnNext: Btn = new Btn('next', 'Naar speeldata', 'enter');

    opslaanClicked(andNext?: boolean) {
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.pouleRonde));
        rondeToSave.poules.forEach(p => {
            p.koppelIds = p.koppels.map(k => k.kopId);
            p.koppels = [];
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
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
        this.gotoPage(`rondes/poule/${this.ronde.rndId}/data`, this.router.url);
    }

    clearHovered() {
        this.koppelsPerDagen.forEach(kpd => {
            kpd.idxFirst = kpd.idxSecond = kpd.idxRest = -1;
        });
    }

    koppelHovered(koppel: RondeKoppel) {
        this.koppelsPerDagen.forEach(kpd => {
            kpd.idxFirst = kpd.koppelsFirst.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxSecond = kpd.koppelsSecond.findIndex(kop => kop.kopId == koppel.kopId);
            kpd.idxRest = kpd.koppelsRest.findIndex(kop => kop.kopId == koppel.kopId);
        });
    }

    koppelClicked(koppel: RondeKoppel, kpd: KoppelsPerDag) {
        let allDagPoules = this.pouleRonde.poules.filter(pl => pl.dagNr == -1 || pl.dagNr == kpd.dagNr);
        let availDagPoule = allDagPoules.find(pl => this.pouleIsAvailable(pl));
        if (availDagPoule) {
            this.addKoppelToPoule(availDagPoule, koppel, kpd);
        }
        else {
            if (this.pouleRonde.poules.length == this.maxPoules || allDagPoules.length == this.maxWeekdagen) {
                this.alert.showWarning(`Er kan geen nieuwe poule voor ${kpd.dagNaam} worden aangemaakt`);
                return;
            }
            availDagPoule = new Poule(this.config.maxKoppelsPerPoule);
            //availDagPoule.pouleId = String.fromCharCode(65 + this.pouleRonde.poules.length);
            this.pouleRonde.poules.push(availDagPoule);
            this.addKoppelToPoule(availDagPoule, koppel, kpd);
        }
    }

    removeKoppelFromPoule(idxPoule: number, idxKoppel: number) {
        const poule = this.pouleRonde.poules[idxPoule];
        const koppelToRemove = poule.koppels[idxKoppel];
        if (koppelToRemove.kopId == '') {
            return;
        }
        this.pouleKoppelBackToKoppelsPerDagen(koppelToRemove);
        poule.koppels[idxKoppel] = new RondeKoppel();
        poule.koppelIds[idxKoppel] = '';
        if (this.pouleIsEmpty(poule)) {
            this.pouleRonde.poules.splice(idxPoule, 1);
        }
        this.touched = true;
        this.poulesOk = false;
    }

    removePoule(idx: number) {
        this.pouleRonde.poules[idx].koppels.forEach((kpl) => {
            if (kpl.kopId != '') {
                this.pouleKoppelBackToKoppelsPerDagen(kpl);
            }
        });
        this.pouleRonde.poules.splice(idx, 1);
        //this.renamePoules();
        this.touched = true;
        this.poulesOk = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.poulesOk) {
                if (this.touched) {
                    this.buttonPressed(this.btnSaveNext);
                    return false;
                }
                else {
                    this.buttonPressed(this.btnNext);
                    return false;
                }
            }
            else {
                this.buttonPressed(this.btnSaveDef);
                return false;
            }
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyS') {
            this.buttonPressed(this.btnSave);
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
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                console.log(data);
                this.pouleRonde = data;
                if (this.pouleRonde.koppels.length < this.koppels.length) {
                    this.existingKoppelIds = this.pouleRonde.koppels.map(kpl => kpl.kopId);
                    this.aanvullenRondeKoppels();
                }
                this.fillKoppelsPerDagen();
                console.log(this.koppelsPerDagen);
                this.pouleRonde.poules.forEach(poule => {
                    poule.volgNr = 0;
                    poule.id = '';
                    poule.koppels = [];
                    let maxKoppels = poule.koppelIds.length;
                    while (maxKoppels--) poule.koppels.push(new RondeKoppel()); 
                    poule.koppelIds.forEach((kplId, idx) => {
                        if (kplId != '') {
                            const foundKoppel = this.pouleRonde.koppels.find(kpl => kpl.kopId == kplId);
                            if (foundKoppel) {
                                poule.koppels[idx] = foundKoppel;
                                this.removeKoppelFromKoppelsPerDagen(foundKoppel);
                            }
                        }
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

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'save' || btn.id == 'savedef') {
                    this.opslaanClicked();
                }
                else if (btn.id == 'savenext') {
                    this.opslaanClicked(true);
                }
                else if (btn.id == 'next') {
                    this.nextClicked();
                }
            }, 250);
        }, 250);
    }

    private aanvullenRondeKoppels() {
        this.koppels.forEach(kpl => {
            if (!this.existingKoppelIds.includes(kpl.kopId)) {
                const rndKoppel: RondeKoppel = new RondeKoppel();
                Object.assign(rndKoppel, kpl);
                this.pouleRonde.koppels.push(rndKoppel);
                this.existingKoppelIds.push(kpl.kopId);
            }
        });
    }

    private addKoppelToPoule(poule: Poule, koppel: RondeKoppel, kpd: KoppelsPerDag) {
        const idxToAdd = this.getFirstAvailable(poule);
        if (this.pouleIsEmpty(poule)) {
            poule.dagNr = kpd.dagNr;
            poule.dagNaam = kpd.dagNaam;
        }
        poule.koppels[idxToAdd] = koppel;
        poule.koppelIds[idxToAdd] = koppel.kopId;
        //poule.koppels.sort(this.compareRondeKoppels);
        if (this.pouleIsFilled(poule)) {
            this.setWedstrijdenEnVolgorde(poule);
        }
        this.removeKoppelFromKoppelsPerDagen(koppel);
        this.touched = true;
        this.poulesOk = this.allPoulesFilled();
    }

    private setWedstrijdenEnVolgorde(poule: Poule) {
        poule.koppels.forEach((kop, idx) => {
            //kop.id = String.fromCharCode(65 + idx);
            kop.matches = [];
        });
        poule.koppels.forEach((splKop, idxSK) => {
            poule.koppels.forEach((tegKop, idxTK) => {
                if (idxSK != idxTK) {
                    const match = new KoppelMatch(splKop, tegKop);
                    match.volgNr = this.matchToNrs['m' + idxSK + idxTK];
                    splKop.matches.push(match);
                }
            });
        });
    }

    private allPoulesFilled(): boolean {
        return this.pouleRonde.poules.length == this.maxPoules &&
                this.pouleRonde.poules.every(pl => pl.koppels.length == this.config.maxKoppelsPerPoule);
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
            this.pouleRonde.koppels.forEach(koppel => {
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

    private pouleKoppelBackToKoppelsPerDagen(koppel: RondeKoppel) {
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

    private pouleIsEmpty(poule: Poule): boolean {
        return poule.koppels.every(kpl => kpl.kopId == '');
    }

    private pouleIsFilled(poule: Poule): boolean {
        return !poule.koppels.some(kpl => kpl.kopId == '');
    }

    private pouleIsAvailable(poule: Poule): boolean {
        return poule.koppels.some(kpl => kpl.kopId == '');
    }

    private getFirstAvailable(poule: Poule): number {
        return poule.koppels.findIndex(kpl => kpl.kopId == '');
    }

    private renamePoules() {
        this.pouleRonde.poules.forEach((poule, idx) => {
            poule.id = String.fromCharCode(65 + idx);
        });
    }

    private compareKoppels(a: Koppel, b: Koppel): number {
        return b.kopMoyenne - a.kopMoyenne;
    }

    private compareRondeKoppels(a: RondeKoppel, b: RondeKoppel): number {
        return b.kopMoyenne - a.kopMoyenne;
    }

}
