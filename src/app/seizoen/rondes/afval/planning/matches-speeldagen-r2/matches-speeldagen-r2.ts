import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen, SpeelWeek, SpeelWeekDag } from '../../../../../model/seizoen';
import { Ronde, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { RondeKoppel } from '../../../../../model/koppel';
import { NgClass } from '@angular/common';
import { Btn } from '../../../../../model/misc';
import { Button } from '../../../../../shared/button/button';
import { SpeeldagView } from '../../speeldag-view/speeldag-view';
import { ConfirmDialogType, ConfirmKoppelsDialogType } from '../../../../../model/dialogs';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-matches-speeldagen-r2',
    imports: [
        SpeeldagView,
        ConfirmDialog,
        Button,
        NgClass
    ],
    templateUrl: './matches-speeldagen-r2.html',
    styleUrl: './matches-speeldagen-r2.css',
})
export class MatchesSpeeldagenR2 extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    speelDag: RondeSpeelDag = new RondeSpeelDag(0);
    idxSpeelDag: number = -1;
    speelWeken: SpeelWeek[] = [];
    spDagPerc: number = 100;
    today: string = '';
    touched: boolean = false;
    alleDataToegekend: boolean = false;
    confirmKoppels: ConfirmKoppelsDialogType = new ConfirmKoppelsDialogType();

    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);
    btnSaveDef: Btn = new Btn('savedef', 'Opslaan', 'enter');
    btnSaveNext: Btn = new Btn('saveexit', 'Opslaan en planning afsluiten', 'enter');
    btnNext: Btn = new Btn('exit', 'Terug naar rondes', 'enter');
    btnKpls: Btn = new Btn('kpls', 'Koppels', 'K', 1);

    opslaanClicked(andExit?: boolean) {
        this.afvalRonde.status.gepland = this.alleDataToegekend;
        if (this.alleDataToegekend) {
            this.afvalRonde.speelDagen.sort(this.compareSpeelDagen);
        }
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.afvalRonde));
        rondeToSave.speelDagen.forEach(sd => {
            sd.matches.forEach(ma => {
                ma.koppelIds = ma.koppels.map(kpl => kpl.kopId);
                ma.koppels = [];
            });
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.touched = false;
            if (this.afvalRonde.status.gepland != this.ronde.status.gepland) {
                this.ronde.status.gepland = this.afvalRonde.status.gepland;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    if (this.alleDataToegekend) {
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

    speelDagClicked(idx: number) {

    }

    naarKoppelsClicked() {
        if (!this.afvalRonde.koppels.length) {
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

    speelWeekDagClicked(dag: SpeelWeekDag) {
        if (!dag.selectable || this.idxSpeelDag < 0) {
            return;
        }
        if (dag.speeldag) {
            dag.speeldag.datum = '';
        }
        this.speelWeken.some(week => {
            return week.weekDagen.some(dg => {
                if (dg.speeldag && dg.speeldag.dagId == this.speelDag.dagId) {
                    dg.speeldag.status.gepland = false;
                    dg.speeldag = undefined;
                    return true;
                }
                else {
                    return false;
                }
            });
        });
        dag.speeldag = this.speelDag;
        this.speelDag.datum = dag.dagDatum;
        this.speelDag.status.gepland = true;
        this.setSelectables();
        this.idxSpeelDag = -1;
        this.speelDag = new RondeSpeelDag(0);
        this.setUpdateStatus();
        console.log(this.afvalRonde.speelDagen);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Ronde - Plannen`;
        
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            this.ronde = this.rondes[1];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Speeldata toekennen`;
            this.today = new Date().toISOString().substring(0, 10);
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.afvalRonde = data;
                this.afvalRonde.speelDagen.forEach(sd => {
                    sd.matches.forEach(match => {
                        match.koppelIds.forEach(id => {
                            if (id == '') {
                                match.koppels.push(new RondeKoppel());
                            }
                            else {
                                const kop = this.afvalRonde.koppels.find(kpl => kpl.kopId == id);
                                if (kop) {
                                    kop.ingepland = true;
                                    match.koppels.push(kop);
                                }        
                            }
                        });
                    });
                });
                this.speelWeken = this.aanmakenSpeelweken();
                if (this.speelWeken.length) {
                    this.spDagPerc = 100 / this.speelWeken.length;
                }
                this.afvalRonde.speelDagen.forEach((sdag, idx) => {
                    if (sdag.dagId == '') {
                        sdag.dagId = '' + (idx + 1);
                    }
                    if (sdag.datum != '') {
                        this.speelWeken.some(week => {
                            return week.weekDagen.some(dag => {
                                if (dag.dagDatum == sdag.datum) {
                                    dag.speeldag = sdag;
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            });
                        });
                    }
                });
                this.setUpdateStatus();
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

    private setSelectables(sd?: RondeSpeelDag) {
        this.speelWeken.forEach(week => {
            week.weekDagen.forEach(dag => {
                dag.selectable = sd ? sd.dagNr == dag.dagNr : false;
            });
        });
    }

    private aanmakenSpeelweken(): SpeelWeek[] {
        return this.dater.getSpeelweken(this.ronde.periode, this.config.speelDagen.map(sd => sd.dagNr));
    }

    private setUpdateStatus() {
        this.alleDataToegekend = this.afvalRonde.speelDagen.every(sd => sd.datum != '');
        this.touched = true;
    }

    private compareSpeelDagen(a: RondeSpeelDag, b: RondeSpeelDag): number {
        if (a.datum == b.datum) {
            return 0;
        }
        if (a.datum == '') {
            return 1;
        }
        if (b.datum == '') {
            return -1;
        }
        return (a.datum < b.datum) ? -1 : 1;
    }
    
}
