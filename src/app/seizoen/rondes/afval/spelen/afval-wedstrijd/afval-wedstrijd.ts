import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LijstView } from '../../../../../shared/lijst-view/lijst-view';
import { Button } from '../../../../../shared/button/button';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';
import { DecimalPipe, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Ronde, RondeMatch, SpeelRonde } from '../../../../../model/ronde';
import { KoppelMatch, KoppelWedstrijd, RondeKoppel } from '../../../../../model/koppel';
import { KoppelSpeler, LijstSpeler } from '../../../../../model/speler';
import { ConfirmDialogType } from '../../../../../model/dialogs';
import { Btn, Uitslag } from '../../../../../model/misc';
import { isIntegerNotNegative, notEmpty, validDateNotFuture, wedstrijdFormValidator } from '../../../../../directives/validators';

@Component({
    selector: 'app-afval-wedstrijd',
    imports: [
        ReactiveFormsModule,
        LijstView,
        Button,
        ConfirmDialog,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './afval-wedstrijd.html',
    styleUrl: './afval-wedstrijd.css',
})
export class AfvalWedstrijd extends Base implements OnInit {
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    afvalRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    match: RondeMatch = new RondeMatch(new RondeKoppel(), new RondeKoppel());
    koppels: RondeKoppel[] = [];
    splSpl: KoppelSpeler = new KoppelSpeler();
    tegSpl: KoppelSpeler = new KoppelSpeler();
    splHcapCar: number = 0;
    tegHcapCar: number = 0;
    splWed: Uitslag = new Uitslag();
    tegWed: Uitslag = new Uitslag();
    lijsten: LijstSpeler[] = [];
    confirmDelete: ConfirmDialogType = new ConfirmDialogType('Verwijder wedstrijd', ['Deze wedstrijd verwijderen.']);
    confirmBarrage: ConfirmDialogType = new ConfirmDialogType('Barrage');
    today: string = '';
    idxDag: number = -1;
    idxMatch: number = -1;
    idxWed: number = -1;
    idxBar: number = 0;
    aantBar: number = 0;
    viewMode: boolean = true;
    dataReady: boolean = false;

    btnSave: Btn = new Btn('save', 'Opslaan', 'enter');
    btnDel: Btn = new Btn('del', 'Verwijder wedstrijd', 'enter');

    uitslagForm!: FormGroup;

    enterPressed() {
        if (this.viewMode) {
            this.buttonPressed(this.btnDel);
        }
        else {
            if (this.uitslagForm && this.uitslagForm.valid) {
                this.buttonPressed(this.btnSave);
            }
        }
    }

    opslaanClicked() {
        this.uitslagToevoegen();
    }

    verwijderenClicked() {
        this.confirmDelete.open = true;
    }

    confirmVerwijderenReplied(confirmed: boolean) {
        this.confirmDelete.open = false;
        if (confirmed) {
            this.wedstrijdVerwijderen();
        }
    }

    confirmBarrageReplied(confirmed: boolean) {
        if (confirmed) {
            const idx = Math.abs(this.idxBar - 1);
            this.koppels[idx].afgevallen = true;
            this.koppels[this.idxBar].afgevallen = false;
            this.rondeOpslaanEnExit();
            this.confirmBarrage.open = false;
        }
        else {
            if (this.aantBar > 2) {
                this.confirmBarrage.open = false;
            }
            else {
                this.wisselBarrageSpeler();
            }
        }
    }

    kleurClicked(idx: number) {
        if (idx == 0) {
            this.splWit?.setValue(!this.splWit.value);
            this.tegWit?.setValue(!this.splWit?.value);
        }
        else {
            this.tegWit?.setValue(!this.tegWit.value);
            this.splWit?.setValue(!this.tegWit?.value);
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.confirmDelete.open || this.confirmBarrage.open) {
            return false;
        }
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyB') {
            if (this.koppels[0].uitslag.brt < (this.ronde.rndBeurten * 2)) {
                return false;
            }
            if ((this.koppels[0].uitslag.car + this.koppels[0].uitslag.handicap) != (this.koppels[1].uitslag.car + this.koppels[1].uitslag.handicap)) {
                return false;
            }
            this.aantBar = 0;
            this.idxBar = 0;
            this.confirmBarrage.texts = ['De barrage is gewonnen door:', `${this.koppels[this.idxBar].spelers[this.idxWed].splNaam} ?`];
            this.confirmBarrage.open = true;
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
        this.header.subtitle = 'scorebord';

        let id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const rondeId = Number(id);

        id = this.route.snapshot.paramMap.get('dagId');
        if (!id) {
            this.alert.showError('Kan dag ID in URL niet vinden.');
            return;
        }
        const dagId = id;

        id = this.route.snapshot.paramMap.get('splKopId');
        if (!id) {
            this.alert.showError('Kan ID koppel 1 in URL niet vinden.');
            return;
        }
        const splKopId = id;

        id = this.route.snapshot.paramMap.get('tegKopId');
        if (!id) {
            this.alert.showError('Kan ID koppel 2 in URL niet vinden.');
            return;
        }
        const tegKopId = id;
        
        const idx = this.route.snapshot.paramMap.get('wedIdx');
        if (!idx) {
            this.alert.showError('Kan wedstrijd index in URL niet vinden.');
            return;
        }
        const wedIdx = Number(idx);
        
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen),
            this.dao.getWedstrijd()
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            const idxRonde = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
            if (idxRonde < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idxRonde];
            this.today = new Date().toISOString().substring(0, 10);
            this.header.datum = this.dater.dateReverse(this.today);
            this.idxWed = wedIdx;
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.afvalRonde = data;
                console.log(this.afvalRonde);
                this.idxDag = this.afvalRonde.speelDagen.findIndex(sdag => sdag.dagId == dagId);
                if (this.idxDag < 0) {
                    this.alert.showError(`Speeldag met ID '${dagId}' niet gevonden.`);
                    return;
    
                }
                const dag = this.afvalRonde.speelDagen[this.idxDag];
                this.idxMatch = dag.matches.findIndex(mat => mat.koppelIds.includes(splKopId) && mat.koppelIds.includes(tegKopId));
                if (this.idxMatch < 0) {
                    this.alert.showError(`AfvalMatch met koppel IDs '${splKopId} - ${tegKopId}' niet gevonden.`);
                    return;
                }
                this.match = dag.matches[this.idxMatch];
                this.match.koppelIds.forEach((kplId, idx) => {
                    if (kplId != '') {
                        const foundKoppel = this.afvalRonde.koppels.find(kpl => kpl.kopId == kplId);
                        if (foundKoppel) {
                            this.match.koppels[idx] = foundKoppel;
                        }
                    }
                });
                this.koppels = this.match.koppels;
                this.splSpl = this.koppels[0].spelers[this.idxWed];
                this.tegSpl = this.koppels[1].spelers[this.idxWed];
                if (this.splSpl.splHand < this.tegSpl.splHand) {
                    this.tegHcapCar = this.tegSpl.splHand - this.splSpl.splHand;
                }
                if (this.tegSpl.splHand < this.splSpl.splHand) {
                    this.splHcapCar = this.splSpl.splHand - this.tegSpl.splHand;
                }
                this.splWed = this.koppels[0].splUitslagen[this.idxWed].uitslag;
                this.tegWed = this.koppels[1].splUitslagen[this.idxWed].uitslag;
                this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd`;
                this.createUitslagForm();
                this.setViewMode();
                if (!this.viewMode) {
                    this.createUitslagForm();
                    this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd toevoegen`;
                }
                else {
                    this.lijsten = this.createScoreLijsten();
                }
                this.dataReady = true;
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
                if (btn.id == 'save') {
                    this.opslaanClicked();
                }
                else if (btn.id == 'del') {
                    this.verwijderenClicked();
                }
            }, 250);
        }, 250);
    }

    private wisselBarrageSpeler() {
        this.idxBar = Math.abs(this.idxBar - 1);
        this.confirmBarrage.texts = ['De barrage is gewonnen door:', `${this.koppels[this.idxBar].spelers[this.idxWed].splNaam} ?`];
        this.aantBar++;
    }

    private setViewMode() {
        this.viewMode = this.splWed.brt > 0;
    }

    private createScoreLijsten(): LijstSpeler[] {
        if (!this.splWed.sco.length) {
            return [];
        }
        let result: LijstSpeler[] = [];
        if (this.splWed.metWit) {
            let spl = new LijstSpeler(this.splSpl);
            spl.score = this.splWed.sco;
            result.push(spl);
            spl = new LijstSpeler(this.tegSpl);
            spl.score = this.tegWed.sco;
            result.push(spl);
        }
        else {
            let spl = new LijstSpeler(this.tegSpl);
            spl.score = this.tegWed.sco;
            result.push(spl);
            spl = new LijstSpeler(this.splSpl);
            spl.score = this.splWed.sco;
            result.push(spl);
        }
        return result;
    }

    private uitslagToevoegen() {
        const splKoppel = this.koppels[0];
        const tegKoppel = this.koppels[1];
        // speler wedstrijd uitslag
        splKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        this.splWed = splKoppel.splUitslagen[this.idxWed].uitslag;
        this.splWed.metWit = this.splWit?.value;
        this.splWed.sco = [];
        this.splWed.brt = this.ronde.rndBeurten;
        this.splWed.car = this.splCar?.value;
        this.splWed.handicap = this.splHcapCar;
        this.splWed.moy = (this.splWed.brt == 0) ? 0 : this.splWed.car / this.splWed.brt;
        this.setSpelerPunten(this.splWed, this.splCar?.value + this.splHcapCar, this.tegCar?.value + this.tegHcapCar, this.splWed.moy, this.splSpl.splMoy);
        this.splWed.ser = this.splSer?.value;
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.splUitslagen.forEach(splUit => this.addUitslagToOtherUitslag(splUit.uitslag, splKoppel.uitslag));
        // tegenstander wedstrijd uitslag
        tegKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        this.tegWed = tegKoppel.splUitslagen[this.idxWed].uitslag;
        this.tegWed.metWit = this.tegWit?.value;
        this.tegWed.sco = [];
        this.tegWed.brt = this.ronde.rndBeurten;
        this.tegWed.car = this.tegCar?.value;
        this.tegWed.handicap = this.tegHcapCar;
        this.tegWed.moy = (this.tegWed.brt == 0) ? 0 : this.tegWed.car / this.tegWed.brt;
        this.setSpelerPunten(this.tegWed, this.tegCar?.value + this.tegHcapCar, this.splCar?.value + this.splHcapCar, this.tegWed.moy, this.tegSpl.splMoy);
        this.tegWed.ser = this.tegSer?.value;
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.splUitslagen.forEach(splUit => this.addUitslagToOtherUitslag(splUit.uitslag, tegKoppel.uitslag));
        // winst of verlies
        if (this.splWed.car > this.tegWed.car) {
            this.splWed.winst = 1;
            this.tegWed.verlies = 1;
        }
        else if (this.tegWed.car > this.splWed.car) {
            this.tegWed.winst = 1;
            this.splWed.verlies = 1;
        }
        else {
            this.splWed.gelijk = this.tegWed.gelijk = 1;
        }
        this.afvalRonde.status.gestart = true;
        this.afvalRonde.status.gereed = this.afvalRonde.koppels.every(kp => kp.uitslag.brt == (2 * this.ronde.rndBeurten));
        // als beide wedstrijden gespeeld, wie valt af?
        if (splKoppel.uitslag.brt == (this.ronde.rndBeurten * 2)) {
            if ((splKoppel.uitslag.car + splKoppel.uitslag.handicap) == (tegKoppel.uitslag.car + tegKoppel.uitslag.handicap)) {
                // open barrage dialog
                this.aantBar = 0;
                this.idxBar = 0;
                this.confirmBarrage.texts = ['De barrage is gewonnen door:', `${this.koppels[this.idxBar].spelers[this.idxWed].splNaam} ?`];
                this.confirmBarrage.open = true;
            }
            else {
                if ((splKoppel.uitslag.car + splKoppel.uitslag.handicap) > (tegKoppel.uitslag.car + tegKoppel.uitslag.handicap)) {
                    tegKoppel.afgevallen = true;
                }
                else {
                    splKoppel.afgevallen = true;
                }
                // opslaan
                this.rondeOpslaanEnExit();        
            }
        }
        else {
            // opslaan
            this.rondeOpslaanEnExit();    
        }
    }

    private wedstrijdVerwijderen() {
        const splKoppel = this.koppels[0];
        const tegKoppel = this.koppels[1];
        // speler wedstrijd uitslag
        splKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        this.splWed = splKoppel.splUitslagen[this.idxWed].uitslag;
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.splUitslagen.forEach(splUit => this.addUitslagToOtherUitslag(splUit.uitslag, splKoppel.uitslag));
        // tegenstander wedstrijd uitslag
        tegKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        this.tegWed = tegKoppel.splUitslagen[this.idxWed].uitslag;
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.splUitslagen.forEach(splUit => this.addUitslagToOtherUitslag(splUit.uitslag, tegKoppel.uitslag));
        this.afvalRonde.status.gestart = this.afvalRonde.koppels.some(kp => kp.uitslag.brt > 0);
        this.afvalRonde.status.gereed = false;
        // opslaan
        this.rondeOpslaanEnExit(true);
    }

    private rondeOpslaanEnExit(wedVerwijderd?: boolean) {
        const msg = wedVerwijderd ? 'Wedstrijd succesvol verwijderd.' : 'Uitslag succesvol toegevoegd.';
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.afvalRonde));
        const matchToSave: RondeMatch = rondeToSave.speelDagen[this.idxDag].matches[this.idxMatch];
        matchToSave.koppelIds = matchToSave.koppels.map(k => k.kopId);
        matchToSave.koppels = [];
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            if (this.ronde.status.gereed != this.afvalRonde.status.gereed || this.ronde.status.gestart != this.afvalRonde.status.gestart) {
                this.ronde.status.gereed = this.afvalRonde.status.gereed;
                this.ronde.status.gestart = this.afvalRonde.status.gestart;
                this.dao.saveRondes(this.header.seizoen, this.rondes)
                .then(resp2 => {
                    this.alert.showSuccess(msg);
                    this.escapePressed();
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.alert.showSuccess(msg);
                this.escapePressed();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private addUitslagToOtherUitslag(source: Uitslag, target: Uitslag) {
        target.car += source.car;
        target.brt += source.brt;
        target.moy = (target.brt == 0) ? 0 : target.car / target.brt;
        if (source.ser > target.ser) {
            target.ser = source.ser;
        }
        target.pnt += source.pnt;
        target.weds += source.weds;
        target.winst += source.winst;
        target.gelijk += source.gelijk;
        target.verlies += source.verlies;
    }

    private setSpelerPunten(uitslag: Uitslag, carSpl: number, carTeg: number, gsMoy: number, tsMoy: number) {
        let punten = 0;
        uitslag.weds = 1;
        if (carSpl > carTeg) {
            punten = this.config.pntWinst;
            uitslag.winst = 1;
        }
        else if (carSpl == carTeg) {
            punten = this.config.pntGelijk;
            uitslag.gelijk = 1;
        }
        else {
            uitslag.verlies = 1;
        }
        if (gsMoy > tsMoy) {
            punten += this.config.pntMoyenne;
        }
        uitslag.pnt = punten;
    }

    private createUitslagForm() {
        this.uitslagForm =  this.fb.nonNullable.group({
            datum: [this.match.datum || this.today, [Validators.required, notEmpty(), validDateNotFuture()]],
            splWit: [this.splWed.metWit],
            splCar: [this.splWed.car, [Validators.min(0), isIntegerNotNegative()]],
            splSer: [this.splWed.ser, [Validators.min(0), isIntegerNotNegative()]],
            tegWit: [this.tegWed.metWit],
            tegCar: [this.tegWed.car, [Validators.min(0), isIntegerNotNegative()]],
            tegSer: [this.tegWed.ser, [Validators.min(0), isIntegerNotNegative()]],
            beurten: [this.ronde.rndBeurten]
        }, { validators: wedstrijdFormValidator });
        if (!this.viewMode) {
            this.uitslagForm.get('datum')?.setValue(this.today);
            this.uitslagForm.get('splWit')?.setValue(true);
            this.uitslagForm.get('tegWit')?.setValue(true);
        }
    }

    get datum() {
        return this.uitslagForm?.get('datum');
    }
    get splWit() {
        return this.uitslagForm?.get('splWit');
    }
    get splCar() {
        return this.uitslagForm?.get('splCar');
    }
    get splSer() {
        return this.uitslagForm?.get('splSer');
    }
    get tegWit() {
        return this.uitslagForm?.get('tegWit');
    }
    get tegCar() {
        return this.uitslagForm?.get('tegCar');
    }
    get tegSer() {
        return this.uitslagForm?.get('tegSer');
    }
    
}
