import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen, SpeelWeek } from '../../../../../model/seizoen';
import { Ronde, RondeMatch, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { ConfirmKoppelsDialogType } from '../../../../../model/dialogs';
import { Btn, Dag, Uitslag } from '../../../../../model/misc';
import { KoppelSpelerUitslagen, RondeKoppel } from '../../../../../model/koppel';
import { Button } from '../../../../../shared/button/button';
import { DecimalPipe, NgClass } from '@angular/common';
import { KoppelSpeler } from '../../../../../model/speler';
import { Helper } from '../../../../../services/helper';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';

class MatchCombo {
    id: string = '';
    matches: RondeMatch[] = [];
}

@Component({
    selector: 'app-matches-speeldag-kwart',
    imports: [
        ConfirmDialog,
        Button,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './matches-speeldag-kwart.html',
    styleUrl: './matches-speeldag-kwart.css',
})
export class MatchesSpeeldagKwart extends Base implements OnInit {
    helper = inject(Helper);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    kwartRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    achtRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    speelDag: RondeSpeelDag = new RondeSpeelDag(0);
    mogelijkeDagen: Dag[] = [];
    idxDag: number = -1;
    combos: MatchCombo[] = [];
    idxCombo: number = -1;
    idxMatch: number = -1;
    today: string = '';
    touched: boolean = false;
    datumToegekend: boolean = false;
    confirmKoppels: ConfirmKoppelsDialogType = new ConfirmKoppelsDialogType();
    matchIds: string[] = ['A', 'B', 'C', 'D'];

    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);
    btnSaveDef: Btn = new Btn('savedef', 'Opslaan', 'enter');
    btnSaveNext: Btn = new Btn('saveexit', 'Opslaan en planning afsluiten', 'enter');
    btnNext: Btn = new Btn('exit', 'Terug naar rondes', 'enter');
    btnKpls: Btn = new Btn('kpls', 'Koppels', 'K', 1);

    opslaanClicked(andExit?: boolean) {
        this.kwartRonde.status.gepland = this.datumToegekend;
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.kwartRonde));
        rondeToSave.speelDagen.forEach(sd => {
            sd.matches.forEach(ma => {
                ma.koppelIds = ma.koppels.map(kpl => kpl.kopId);
                ma.koppels = [];
            });
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.touched = false;
            if (this.kwartRonde.status.gepland != this.ronde.status.gepland) {
                this.ronde.status.gepland = this.kwartRonde.status.gepland;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    if (this.datumToegekend) {
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
                if (andExit) {
                    this.exitClicked();
                }
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    exitClicked() {
        this.escapePressed();
    }

    naarKoppelsClicked() {
        if (!this.kwartRonde.koppels.length) {
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

    dagClicked(idx: number) {
        if (idx == this.idxDag) {
            return
        }
        this.idxDag = idx;
        this.kwartRonde.speelDagen[0].dagNr = this.mogelijkeDagen[idx].nr;
        this.kwartRonde.speelDagen[0].dagNaam = this.mogelijkeDagen[idx].naam;
        this.kwartRonde.speelDagen[0].datum = this.mogelijkeDagen[idx].datum;
        this.datumToegekend = true;
        this.touched = true;
    }

    matchOmhoogClicked(idxC: number, idxM: number) {
        let arr = this.kwartRonde.speelDagen[0].matches;
        const idxUp = (2 * idxC) + idxM;
        [arr[idxUp - 1], arr[idxUp]] = [arr[idxUp], arr[idxUp - 1]];
        arr.forEach((match, idx) => {
            match.koppels.forEach(kop => kop.pouleKplId == '' + (idx + 1));
        });
        this.matchesToCombos(arr);
    }

    matchOmlaagClicked(idxC: number, idxM: number) {
        let arr = this.kwartRonde.speelDagen[0].matches;
        const idxDown = (2 * idxC) + idxM;
        [arr[idxDown], arr[idxDown + 1]] = [arr[idxDown + 1], arr[idxDown]];
        arr.forEach((match, idx) => {
            match.koppels.forEach(kop => kop.pouleKplId == '' + (idx + 1));
        });
        this.matchesToCombos(arr);        
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.datumToegekend) {
                if (this.touched) {
                    this.buttonPressed(this.btnSaveNext);
                }
                else {
                    this.buttonPressed(this.btnNext);
                }
            }
            else {
                if (this.touched) {
                    this.buttonPressed(this.btnSaveDef);
                }
            }
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;    
        }
        if (event.code === 'KeyS') {
            if (this.datumToegekend && this.touched) {
                this.buttonPressed(this.btnSave);
            }
            return false;
        }
        if (event.code === 'KeyK') {
            this.buttonPressed(this.btnKpls);
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Ronde - Plannen`;

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            const idx = this.rondes.findIndex(rnd => rnd.fileNaam == 'kwart-finales');
            if (idx < 0) {
                this.alert.showError(`Ronde met filenaam 'kwart-finales' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idx];
            const prevRonde = this.rondes[idx - 1];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Speeldatum toekennen`;
            this.today = new Date().toISOString().substring(0, 10);
            this.touched = false;
            Promise.all([
                this.dao.getSpeelRondeFile(this.header.seizoen, prevRonde.fileNaam),
                this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            ])
            .then(results => {
                this.achtRonde = results[0];
                this.kwartRonde = results[1];
                if (!prevRonde.status.gereed) {
                    this.alert.showWarning('Kan planning niet uitvoeren. Vorige ronde is nog niet afgewerkt.');
                    return;
                }
                if (this.kwartRonde.koppels.length == 0) {
                    const errMsg = this.getKoppelsAndMatchesFromPrevRonde();
                    if (errMsg != '') {
                        this.alert.showError(errMsg);
                        return;
                    }
                    this.touched = true;
                }
                this.mogelijkeDagen = this.dater.getDagenInPeriode(this.kwartRonde.periode, [], '', this.config.speelDagen.map(sd => sd.dagNr));
                this.kwartRonde.speelDagen.forEach((sd, idx) => {
                    if (idx == 0 && sd.datum != '') {
                        this.datumToegekend = true;
                        this.idxDag = this.mogelijkeDagen.findIndex(dg => dg.datum == sd.datum);
                    }
                    sd.matches.forEach((match, idxM) => {
                        match.koppelIds.forEach(id => {
                            if (id == '') {
                                match.koppels.push(new RondeKoppel());
                            }
                            else {
                                const kop = this.kwartRonde.koppels.find(kpl => kpl.kopId == id);
                                if (kop) {
                                    kop.ingepland = true;
                                    match.koppels.push(kop);
                                }        
                                else {
                                    const errKop = new RondeKoppel();
                                    errKop.kopId = id;
                                    errKop.pouleId = '?';
                                    match.koppels.push(errKop);
                                }
                            }
                        });
                        match.koppels.forEach(kop => kop.pouleKplId = '' + (idxM + 1));
                    });
                });
                [0, 1].forEach(idxCom => {
                    let combo = new MatchCombo();
                    combo.id = (idxCom == 0) ? 'A' : 'B';
                    [0, 1].forEach(idxMat => {
                        combo.matches.push(this.kwartRonde.speelDagen[0].matches[(2 * idxCom) + idxMat]);
                    });
                    this.combos.push(combo);
                });
                console.log(this.combos);
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
                if (btn.id == 'exit') {
                    this.exitClicked();
                }
                else if (btn.id == 'kpls') {
                    this.naarKoppelsClicked();
                }
                else if (btn.id == 'save' || btn.id == 'savedef') {
                    this.opslaanClicked();
                }
                else if (btn.id == 'saveexit') {
                    this.opslaanClicked(true);
                }
            }, 250);
        }, 250);
    }

    private getKoppelsAndMatchesFromPrevRonde(): string {
        let msg = '';
        this.kwartRonde.speelDagen = [];
        let kops: RondeKoppel[] = this.achtRonde.koppels.filter(kpl => !kpl.afgevallen);
        this.kwartRonde.koppels = kops;
        this.kwartRonde.koppels.forEach(kop => {
            kop.ingepland = true;
            this.addUitslagToOtherUitslag(kop.uitslag, kop.totNuToe);
            kop.uitslag = new Uitslag();
            kop.splUitslagen.forEach(splUit => {
                this.addUitslagToOtherUitslag(splUit.uitslag, splUit.totNuToe);
                splUit.uitslag = new Uitslag();
            });
            if (this.ronde.moyBepalen) {
                kop.kopMoyenne = kop.totNuToe.moy;
                kop.spelers.forEach((spl, idx) => {
                    spl.splMoy = kop.splUitslagen[idx].totNuToe.moy;
                    spl.splHand = this.helper.getHandicap(spl.splMoy);
                });
                if (kop.spelers[0].splMoy > kop.spelers[1].splMoy) {
                    const tempSpl: KoppelSpeler = JSON.parse(JSON.stringify(kop.spelers[0]));
                    kop.spelers[0] = kop.spelers[1];
                    kop.spelers[1] = tempSpl;
                    const tempUit: KoppelSpelerUitslagen = JSON.parse(JSON.stringify(kop.splUitslagen[0]));
                    kop.splUitslagen[0] = kop.splUitslagen[1];
                    kop.splUitslagen[1] = tempUit;
                }
            }
        });
        let dag = new RondeSpeelDag(0);
        dag.dagId = '1';
        this.kwartRonde.speelDagen.push(dag);
        [2, 4, 6, 8].forEach(kplNr => {
            if (msg == '') {
                const kpl1 = this.kwartRonde.koppels.find(kpl => kpl.pouleKplId == '' + (kplNr - 1));
                const kpl2 = this.kwartRonde.koppels.find(kpl => kpl.pouleKplId == '' + kplNr);
                if (kpl1 && kpl2) {
                    const match = new RondeMatch(kpl1, kpl2);
                    match.koppels = [];
                    dag.matches.push(match);
                }
                else {
                    const id = kpl1 ? ('' + (kplNr - 1)) : ('' + kplNr);
                    msg = `Winnend koppel met pouleKplId '${id}' niet gevonden in achtste finales.`;
                }
            }
        });
        console.log(this.kwartRonde.speelDagen);
        return msg;
    }

    private matchesToCombos(matches: RondeMatch[]) {
        if (matches.length != 4) {
            this.alert.showError('Probleempje! Het aantal matches is niet 4 maar ' + matches.length);
            return;
        }
        matches.forEach((match, idxM) => {
            match.koppels.forEach(kop => kop.pouleKplId = '' + (idxM + 1));
        });
        this.combos[0].matches[0] = matches[0];
        this.combos[0].matches[1] = matches[1];
        this.combos[1].matches[0] = matches[2];
        this.combos[1].matches[1] = matches[3];
        this.touched = true;
    }

}
