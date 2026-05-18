import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../../model/seizoen';
import { Poule, PouleRonde, Ronde } from '../../../../model/ronde';
import { RondePouleView } from '../../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../../shared/button/button';
import { Btn } from '../../../../model/misc';
import { NgClass } from '@angular/common';
import { DateHelper } from '../../../../services/date-helper';
import { FormsModule } from '@angular/forms';

class PoulesPerDag {
    dagNr: number = 0;
    dagNaam: string = '';
    poules: Poule[] = [];
}
class SelectData {
    dagNr: number = 0;
    data: string[] = [];
}

@Component({
    selector: 'app-poule-ronde-planning-data',
    imports: [
        FormsModule,
        RondePouleView,
        Button,
        NgClass
    ],
    templateUrl: './poule-ronde-planning-data.html',
    styleUrl: './poule-ronde-planning-data.css',
})
export class PouleRondePlanningData extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    poulesPerDagen: PoulesPerDag[] = [];
    idxPoule: number = -1;
    poule: Poule = new Poule();
    mogelijkeSpeelData: SelectData[] = [];
    mogelijkePouleSpeelData: string[] = [];
    maxPoules: number = 0;
    touched: boolean = false;
    poulesOk: boolean = false;
    firstDigit: string = '';
    lastDigit: string = '';

    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);
    btnSaveDef: Btn = new Btn('savedef', 'Opslaan', 'enter');
    btnSaveNext: Btn = new Btn('saveexit', 'Opslaan en planning afsluiten', 'enter');
    btnNext: Btn = new Btn('exit', 'Terug naar rondes', 'enter');

    opslaanClicked(andExit?: boolean) {
        this.poulesOk = this.allDatesFilledOk();
        if (this.poulesOk) {
            this.pouleRonde.poules.sort(this.comparePoules);
            // this.renamePoules();
            this.fillAllPouleKoppelIds();
        }
        this.dao.savePouleRondeFile(this.header.seizoen, this.ronde.fileNaam, this.pouleRonde)
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

    pouleClicked(nr: number) {
        const idx = this.pouleRonde.poules.findIndex(pl => pl.pouleVolgNr == nr);
        if (idx >= 0) {
            this.pouleButtonClicked(idx);
        }
    }

    pouleButtonClicked(idx: number) {
        if (idx == this.idxPoule) {
            this.idxPoule = -1;
            this.poule = new Poule();
            return;
        }
        this.idxPoule = idx;
        this.poule = this.pouleRonde.poules[idx];
        this.mogelijkePouleSpeelData = this.getMogelijkePouleSpeelData(this.poule.pouleDagNr);
        // console.log(this.mogelijkePouleSpeelData);
    }

    pouleDatumSelected() {
        this.touched = true;
        if (this.poule.pouleDatum != '') {
            this.pouleRonde.poules.forEach(pl => {
                if (pl.pouleVolgNr != this.poule.pouleVolgNr && pl.pouleDatum == this.poule.pouleDatum) {
                    pl.pouleDatum = '';
                }
            });
        }
        this.poulesOk = this.allDatesFilledOk();
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
        if (event.code >= 'Digit1' && event.code <= 'Digit9') {
            if (event.code >= this.firstDigit && event.code <= this.lastDigit) {
                const idx = Number(event.code.substring(5)) - 1;
                this.pouleButtonClicked(idx);
                return false;
            }
            return true;
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
            this.dao.getRondes(this.header.seizoen)
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            const idx = this.rondes.findIndex(rnd => rnd.rndId == id);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning ${this.ronde.rndNaam} - Speeldata`;
            this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                if (!this.pouleRonde.poules) {
                    this.pouleRonde.poules = [];
                }
                this.maxPoules = this.config.maxKoppels / this.config.maxKoppelsPerPoule;
                if (this.pouleRonde.poules.length < this.maxPoules) {
                    this.gotoPrevPage();
                    return;
                }
                this.pouleRonde.poules.forEach((pl, idx) => {
                    pl.pouleId = '';
                    pl.pouleVolgNr = idx + 1;
                });
                if (this.pouleRonde.poules.length > 0) {
                    this.firstDigit = 'Digit1';
                    if (this.pouleRonde.poules.length < 10) {
                        this.lastDigit = 'Digit' + this.pouleRonde.poules.length;
                    }
                }
                this.fillPoulesPerDagen();
                this.fillAllMogelijkeSpeelData();
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

    private buttonPressed(btn: Btn) {
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'save' || btn.id == 'savedef') {
                    this.opslaanClicked();
                }
                else if (btn.id == 'saveexit') {
                    this.opslaanClicked(true);
                }
                else if (btn.id == 'exit') {
                    this.exitClicked();
                }
            }, 250);
        }, 250);
    }

    private getMogelijkePouleSpeelData(dagNr: number): string[] {
        const idx = this.mogelijkeSpeelData.findIndex(sd => sd.dagNr == dagNr);
        return (idx < 0) ? [] : this.mogelijkeSpeelData[idx].data;
    }

    private fillPoulesPerDagen() {
        this.config.speelDagen.forEach((sdag) => {
            let ppd = new PoulesPerDag();
            ppd.dagNr = sdag.dagNr;
            ppd.dagNaam = sdag.dagNaam;
            this.pouleRonde.poules.forEach(poule => {
                if (poule.pouleDagNr == ppd.dagNr) {
                    ppd.poules.push(poule);
                }
            });
            this.poulesPerDagen.push(ppd);
        });
    }

    private fillAllMogelijkeSpeelData() {
        this.config.speelDagen.forEach((sdag) => {
            let sd = new SelectData();
            sd.dagNr = sdag.dagNr;
            sd.data = this.dater.getAllWeekDaysOfMonth(Number(this.header.seizoen), 0, sd.dagNr);
            this.mogelijkeSpeelData.push(sd);
        });
    }

    private allDatesFilledOk(): boolean {
        return this.pouleRonde.poules.every(poule => poule.pouleDatum != '');
    }

    private comparePoules(a: Poule, b: Poule): number {
        return a.pouleDatum < b.pouleDatum ? -1 : 1;
    }
    
    private renamePoules() {
        this.pouleRonde.poules.forEach((pl, idx) => {
            pl.pouleId = String.fromCharCode(65 + idx);
        });
    }

    private fillAllPouleKoppelIds() {
        this.pouleRonde.poules.forEach((pl) => {
            pl.pouleKoppels.forEach((pk, idx) => {
                pk.id = String.fromCharCode(65 + idx);
            });
        });
    }
    
}
