import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { Button } from '../../../../../shared/button/button';
import { DecimalPipe, NgClass } from '@angular/common';
import { Helper } from '../../../../../services/helper';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeMatch, RondeSpeelDag, SpeelRonde } from '../../../../../model/ronde';
import { ConfirmKoppelsDialogType } from '../../../../../model/dialogs';
import { Btn, Dag, Uitslag } from '../../../../../model/misc';
import { KoppelSpelerUitslagen, RondeKoppel } from '../../../../../model/koppel';
import { KoppelSpeler } from '../../../../../model/speler';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { notEmpty, validDate } from '../../../../../directives/validators';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-matches-speeldag-finales',
    imports: [
        ReactiveFormsModule,
        ConfirmDialog,
        Button,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './matches-speeldag-finales.html',
    styleUrl: './matches-speeldag-finales.css',
})
export class MatchesSpeeldagFinales extends Base implements OnInit {
    fb = inject(FormBuilder);
    helper = inject(Helper);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    halfRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    speelDag: RondeSpeelDag = new RondeSpeelDag(0);
    speelDatum: Dag = new Dag();
    idxMatch: number = -1;
    today: string = '';
    splDatMsg: string = '';
    touched: boolean = false;
    confirmKoppels: ConfirmKoppelsDialogType = new ConfirmKoppelsDialogType();
    matchIds: string[] = ['A', 'B'];

    btnSave: Btn = new Btn('save', 'Opslaan', 's', 3);
    btnSaveDef: Btn = new Btn('savedef', 'Opslaan', 'enter');
    btnSaveNext: Btn = new Btn('saveexit', 'Opslaan en planning afsluiten', 'enter');
    btnNext: Btn = new Btn('exit', 'Terug naar rondes', 'enter');
    btnKpls: Btn = new Btn('kpls', 'Koppels', 'K', 1);

    datumForm!: FormGroup;

    opslaanClicked(andExit?: boolean) {
        this.halfRonde.status.gepland = false;
        if (this.datumForm.valid) {
            this.halfRonde.status.gepland = true;
            if (this.speelDatum.datum != this.speelDag.datum) {
                this.speelDag.datum = this.speelDatum.datum;
                this.speelDag.dagNaam = this.speelDatum.naam;
                this.speelDag.dagNr = this.speelDatum.nr;
            }
        }
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.halfRonde));
        rondeToSave.speelDagen.forEach(sd => {
            sd.matches.forEach(ma => {
                ma.koppelIds = ma.koppels.map(kpl => kpl.kopId);
                ma.koppels = [];
            });
        });
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.touched = false;
            if (this.halfRonde.status.gepland != this.ronde.status.gepland) {
                this.ronde.status.gepland = this.halfRonde.status.gepland;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    if (this.datumForm.valid) {
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
        if (!this.halfRonde.koppels.length) {
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

    matchOmhoogClicked(idxM: number) {
        let arr = this.speelDag.matches;
        const idxUp = idxM;
        [arr[idxUp - 1], arr[idxUp]] = [arr[idxUp], arr[idxUp - 1]];
        arr.forEach((match, idx) => {
            match.koppels.forEach(kop => kop.pouleKplId == '' + (idx + 1));
        });
        this.touched = true;
    }

    matchOmlaagClicked(idxM: number) {
        let arr = this.speelDag.matches;
        const idxDown = idxM;
        [arr[idxDown], arr[idxDown + 1]] = [arr[idxDown + 1], arr[idxDown]];
        arr.forEach((match, idx) => {
            match.koppels.forEach(kop => kop.pouleKplId == '' + (idx + 1));
        });
        this.touched = true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.datumForm.valid) {
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
            if (this.touched) {
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
            const idx = this.rondes.findIndex(rnd => rnd.fileNaam == 'halve-finales');
            if (idx < 0) {
                this.alert.showError(`Ronde met filenaam 'halve-finales' niet gevonden.`);
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
                const kwartRonde: SpeelRonde = results[0];
                this.halfRonde = results[1];
                if (!prevRonde.status.gereed) {
                    this.alert.showWarning('Kan planning niet uitvoeren. Kwart finales zijn nog niet afgewerkt.');
                    return;
                }
                if (this.halfRonde.koppels.length == 0) {
                    const errMsg = this.getKoppelsAndMatchesFromPrevRonde(kwartRonde);
                    if (errMsg != '') {
                        this.alert.showError(errMsg);
                        return;
                    }
                    this.touched = true;
                }
                const dagen: Dag[] = this.dater.getDagenInPeriode(this.halfRonde.periode, [], '', []);
                this.speelDatum = dagen[0];
                this.halfRonde.speelDagen.forEach((sd, idx) => {
                    if (idx == 0) {
                        if (sd.datum != '') {
                            if (sd.datum != this.speelDatum.datum) {
                                this.speelDatum = this.dater.getDagFromDate(sd.datum);
                                this.touched = true;
                            }
                        }
                    }
                    sd.matches.forEach((match, idxM) => {
                        match.koppelIds.forEach(id => {
                            if (id == '') {
                                match.koppels.push(new RondeKoppel());
                            }
                            else {
                                const kop = kwartRonde.koppels.find(kpl => kpl.kopId == id);
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
                this.speelDag = this.halfRonde.speelDagen[0];
                this.createDatumForm();
                if (this.speelDatum.datum != '' && this.speelDatum.datum < this.today) {
                    this.splDatMsg = 'Let op! Datum ligt in het verleden.';
                }
                console.log(this.halfRonde);
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

    private getKoppelsAndMatchesFromPrevRonde(fromRonde: SpeelRonde): string {
        let msg = '';
        this.halfRonde.speelDagen = [];
        let kops: RondeKoppel[] = fromRonde.koppels.filter(kpl => !kpl.afgevallen);
        this.halfRonde.koppels = kops;
        this.halfRonde.koppels.forEach(kop => {
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
        this.halfRonde.speelDagen.push(dag);
        [2, 4].forEach(kplNr => {
            if (msg == '') {
                const kpl1 = this.halfRonde.koppels.find(kpl => kpl.pouleKplId == '' + (kplNr - 1));
                const kpl2 = this.halfRonde.koppels.find(kpl => kpl.pouleKplId == '' + kplNr);
                if (kpl1 && kpl2) {
                    const match = new RondeMatch(kpl1, kpl2);
                    match.koppels = [];
                    dag.matches.push(match);
                }
                else {
                    const id = kpl1 ? ('' + (kplNr - 1)) : ('' + kplNr);
                    msg = `Winnend koppel met pouleKplId '${id}' niet gevonden in kwart finales.`;
                }
            }
        });
        console.log(this.halfRonde.speelDagen);
        return msg;
    }

    private createDatumForm() {
        this.datumForm =  this.fb.nonNullable.group({
            splDat: [this.speelDatum.datum, [Validators.required, notEmpty(), validDate()]]
        });
        this.datumForm.get('splDat')?.valueChanges.subscribe(val => {
            if (this.datumForm.get('splDat')?.valid) {
                this.speelDatum = this.dater.getDagFromDate(val);
                this.splDatMsg = (val < this.today) ? 'Let op! Datum ligt in het verleden.' : ''; 
            }
            else {
                this.splDatMsg = '';
            }
        });
        if (this.speelDatum.datum == '') {
            this.datumForm.get('splDat')?.setValue(this.today);
            this.speelDatum = this.dater.getDagFromDate(this.today);
        }
    }

    get splDat() {
        return this.datumForm?.get('splDat');
    }

}
