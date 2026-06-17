import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen, SpeelWeek, SpeelWeekDag } from '../../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { Btn, Status } from '../../../../../model/misc';
import { RondePouleView } from '../../../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../../../shared/button/button';
import { NgClass } from '@angular/common';
import { RondeKoppel } from '../../../../../model/koppel';
import { ConfirmKoppelsDialogType } from '../../../../../model/dialogs';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';

class PoulesPerDag {
    dagNr: number = 0;
    dagNaam: string = '';
    poules: Poule[] = [];
}

@Component({
    selector: 'app-poules-speeldagen',
    imports: [
        RondePouleView,
        ConfirmDialog,
        Button,
        NgClass
    ],
    templateUrl: './poules-speeldagen.html',
    styleUrl: './poules-speeldagen.css',
})
export class PoulesSpeeldagen extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    poulesPerDagen: PoulesPerDag[] = [];
    idxPoule: number = -1;
    poule: Poule = new Poule(0);
    maxPoules: number = 0;
    speelWeken: SpeelWeek[] = [];
    touched: boolean = false;
    poulesOk: boolean = false;
    vkDagPerc: number = 100;
    spDagPerc: number = 100;
    confirmKoppels: ConfirmKoppelsDialogType = new ConfirmKoppelsDialogType();

    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);
    btnSaveDef: Btn = new Btn('savedef', 'Opslaan', 'enter');
    btnSaveNext: Btn = new Btn('saveexit', 'Opslaan en planning afsluiten', 'enter');
    btnNext: Btn = new Btn('exit', 'Terug naar rondes', 'enter');
    btnKpls: Btn = new Btn('kpls', 'Koppels', 'K', 1);

    opslaanClicked(andExit?: boolean) {
        this.poulesOk = this.allDatesFilledOk();
        this.pouleRonde.status.gepland = this.poulesOk;
        if (this.poulesOk) {
            this.pouleRonde.poules.sort(this.comparePoules);
            // this.renamePoules();
            this.fillAllPouleKoppelIds();
        }
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.pouleRonde));
        rondeToSave.poules.forEach(p => {
            p.koppelIds = p.koppels.map(k => k.kopId);
            p.koppels = [];
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.touched = false;
            if (this.poulesOk != this.ronde.status.gepland) {
                this.ronde.status.gepland = this.poulesOk;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    if (this.poulesOk) {
                        this.alert.showSuccess(`Planning ${this.ronde.rndNaam} succesvol afgesloten.`);
                        if (andExit) {
                            this.exitClicked();
                        }
                    }
                    else {
                        this.alert.showSuccess(resp.message);
                    }
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.alert.showSuccess(resp.message);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    exitClicked() {
        this.goBackToPage(`rondes`);
    }

    naarKoppelsClicked() {
        if (!this.pouleRonde.koppels.length) {
            return;
        }
        if (this.touched) {
            this.confirmKoppels.open = true;
        }
        else {
            this.confirmKoppelsReplied(true);
        }
    }

    confirmKoppelsReplied(confirmed: boolean) {
        this.confirmKoppels.open = false;
        if (confirmed) {
            this.gotoPage(`rondes/${this.ronde.rndId}/koppels`, this.router.url);
        }
    }

    pouleClicked(nr: number) {
        const idx = this.pouleRonde.poules.findIndex(pl => pl.volgNr == nr);
        if (idx < 0) {
            return;
        }
        if (idx == this.idxPoule) {
            this.idxPoule = -1;
            this.poule = new Poule(0);
            this.setSelectables();
            return;
        }
        this.idxPoule = idx;
        this.poule = this.pouleRonde.poules[idx];
        this.setSelectables(this.poule);
    }

    speelDagClicked(dag: SpeelWeekDag) {
        if (!dag.selectable || this.idxPoule < 0) {
            return;
        }
        if (dag.poule) {
            dag.poule.datum = '';
        }
        this.speelWeken.some(week => {
            return week.weekDagen.some(dg => {
                if (dg.poule && dg.poule.volgNr == this.poule.volgNr) {
                    dg.poule.status.gepland = false;
                    dg.poule = undefined;
                    return true;
                }
                else {
                    return false;
                }
            });
        });
        dag.poule = this.poule;
        this.poule.datum = dag.dagDatum;
        this.poule.status.gepland = true;
        this.setSelectables();
        this.idxPoule = -1;
        this.poule = new Poule(0);
        this.poulesOk = this.allDatesFilledOk();
        this.touched = true;
        console.log(this.pouleRonde.poules);
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
            this.dao.getRondes(this.header.seizoen)
        ])
        .then(results => {
            this.config = results[0];
            if (this.config.speelDagen.length) {
                this.vkDagPerc = 100 / this.config.speelDagen.length;
            }
            this.rondes = results[1];
            const idx = this.rondes.findIndex(rnd => rnd.rndId == id);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning ${this.ronde.rndNaam} - Speeldata`;
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.maxPoules = this.config.maxKoppels / this.config.maxKoppelsPerPoule;
                if (this.pouleRonde.poules.length < this.maxPoules) {
                    this.gotoPrevPage();
                    return;
                }
                this.pouleRonde.poules.forEach((poule, idx) => {
                    poule.id = '';
                    poule.volgNr = idx + 1;
                    poule.koppels = [];
                    let aantKoppels = poule.koppelIds.length;
                    while (aantKoppels--) poule.koppels.push(new RondeKoppel()); 
                    poule.koppelIds.forEach((kplId, idx) => {
                        if (kplId != '') {
                            const foundKoppel = this.pouleRonde.koppels.find(kpl => kpl.kopId == kplId);
                            if (foundKoppel) {
                                poule.koppels[idx] = foundKoppel;
                            }
                        }
                    });
                });
                this.fillPoulesPerDagen();
                this.speelWeken = this.aanmakenSpeelweken();
                if (this.speelWeken.length) {
                    this.spDagPerc = 100 / this.speelWeken.length;
                }
                this.pouleRonde.poules.forEach(pl => {
                    if (pl.datum != '') {
                        this.speelWeken.some(week => {
                            return week.weekDagen.some(dag => {
                                if (dag.dagDatum == pl.datum) {
                                    dag.poule = pl;
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            });
                        });
                    }
                });
                this.poulesOk = this.allDatesFilledOk();
                this.touched = false;
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private setSelectables(pl?: Poule) {
        this.speelWeken.forEach(week => {
            week.weekDagen.forEach(dag => {
                dag.selectable = pl ? pl.dagNr == dag.dagNr : false;
            });
        });
    }

    private aanmakenSpeelweken(): SpeelWeek[] {
        return this.dater.getSpeelweken(this.ronde.periode, this.config.speelDagen.map(sd => sd.dagNr));
    }

    private fillPoulesPerDagen() {
        this.config.speelDagen.forEach((sdag) => {
            let ppd = new PoulesPerDag();
            ppd.dagNr = sdag.dagNr;
            ppd.dagNaam = sdag.dagNaam;
            this.pouleRonde.poules.forEach(poule => {
                if (poule.dagNr == ppd.dagNr) {
                    ppd.poules.push(poule);
                }
            });
            this.poulesPerDagen.push(ppd);
        });
    }

    private allDatesFilledOk(): boolean {
        let countOk = 0;
        this.pouleRonde.poules.forEach(pl => {
            if (pl.koppels.length == this.config.maxKoppelsPerPoule && pl.datum != '') {
                pl.status.gepland = true;
                countOk++;
            }
            else {
                pl.status = new Status();
            }
        });
        return countOk == this.pouleRonde.poules.length;
    }

    private comparePoules(a: Poule, b: Poule): number {
        return a.datum < b.datum ? -1 : 1;
    }
    
    private fillAllPouleKoppelIds() {
        this.pouleRonde.poules.forEach((pl) => {
            pl.koppels.forEach((pk, idx) => {
                pk.pouleKplId = String.fromCharCode(65 + idx);
            });
        });
    }
    
}
