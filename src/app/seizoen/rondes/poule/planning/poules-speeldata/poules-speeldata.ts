import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { Base } from '../../../../../base/base';
import { FormsModule } from '@angular/forms';
import { RondePouleView } from '../../../ronde-poule-view/ronde-poule-view';
import { Button } from '../../../../../shared/button/button';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Btn } from '../../../../../model/misc';
import { RondeKoppel } from '../../../../../model/koppel';

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
    selector: 'app-poules-speeldata',
    imports: [
        FormsModule,
        RondePouleView,
        Button,
        NgClass
    ],
    templateUrl: './poules-speeldata.html',
    styleUrl: './poules-speeldata.css',
})
export class PoulesSpeeldata extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    poulesPerDagen: PoulesPerDag[] = [];
    idxPoule: number = -1;
    poule: Poule = new Poule(0);
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
            this.pouleRonde.status.gepland = true;
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

    pouleClicked(nr: number) {
        const idx = this.pouleRonde.poules.findIndex(pl => pl.volgNr == nr);
        if (idx >= 0) {
            this.pouleButtonClicked(idx);
        }
    }

    pouleButtonClicked(idx: number) {
        if (idx == this.idxPoule) {
            this.idxPoule = -1;
            this.poule = new Poule(0);
            return;
        }
        this.idxPoule = idx;
        this.poule = this.pouleRonde.poules[idx];
        this.mogelijkePouleSpeelData = this.getMogelijkePouleSpeelData(this.poule.dagNr);
        // console.log(this.mogelijkePouleSpeelData);
    }

    pouleDatumSelected() {
        this.touched = true;
        if (this.poule.datum != '') {
            this.pouleRonde.poules.forEach(pl => {
                if (pl.volgNr != this.poule.volgNr && pl.datum == this.poule.datum) {
                    pl.datum = '';
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
                if (poule.dagNr == ppd.dagNr) {
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
        return this.pouleRonde.poules.every(poule => poule.datum != '');
    }

    private comparePoules(a: Poule, b: Poule): number {
        return a.datum < b.datum ? -1 : 1;
    }
    
    // private renamePoules() {
    //     this.pouleRonde.poules.forEach((pl, idx) => {
    //         pl.pouleId = String.fromCharCode(65 + idx);
    //     });
    // }

    private fillAllPouleKoppelIds() {
        this.pouleRonde.poules.forEach((pl) => {
            pl.koppels.forEach((pk, idx) => {
                pk.pouleKplId = String.fromCharCode(65 + idx);
            });
        });
    }
    
}
