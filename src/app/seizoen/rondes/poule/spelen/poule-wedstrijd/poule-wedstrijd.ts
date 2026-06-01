import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { KoppelMatch, KoppelWedstrijd, RondeKoppel } from '../../../../../model/koppel';
import { Btn, Uitslag } from '../../../../../model/misc';
import { KoppelSpeler, LijstSpeler } from '../../../../../model/speler';
import { ConfirmDialogType } from '../../../../../model/dialogs';
import { isIntegerNotNegative, notEmpty, validDateNotFuture, wedstrijdFormValidator } from '../../../../../directives/validators';
import { LijstView } from '../../../../../shared/lijst-view/lijst-view';
import { Button } from '../../../../../shared/button/button';
import { ConfirmDialog } from '../../../../../shared/confirm-dialog/confirm-dialog';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-poule-wedstrijd',
    imports: [
        ReactiveFormsModule,
        LijstView,
        Button,
        ConfirmDialog,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './poule-wedstrijd.html',
    styleUrl: './poule-wedstrijd.css',
})
export class PouleWedstrijd extends Base implements OnInit {
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    poule: Poule = new Poule(0);
    idxPoule: number = -1;
    koppels: RondeKoppel[] = [];
    splSpl: KoppelSpeler = new KoppelSpeler();
    tegSpl: KoppelSpeler = new KoppelSpeler();
    splMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    tegMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    splWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 0);
    tegWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 1);
    lijsten: LijstSpeler[] = [];
    confirmDelete: ConfirmDialogType = new ConfirmDialogType('Verwijder wedstrijd', ['Deze wedstrijd verwijderen.']);
    matchVolgNr: number = 0;
    today: string = '';
    idxWed: number = -1;
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
        if (this.confirmDelete.open) {
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

        let idx: string | null = this.route.snapshot.paramMap.get('pouleIdx');
        if (!idx) {
            this.alert.showError('Kan poule index in URL niet vinden.');
            return;
        }
        const pouleIdx = Number(idx);

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
        
        idx = this.route.snapshot.paramMap.get('wedIdx');
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
                this.pouleRonde = data;
                this.idxPoule = pouleIdx;
                this.poule = this.pouleRonde.poules[this.idxPoule];
                this.poule.koppels = [];
                let aantKoppels = this.poule.koppelIds.length;
                while (aantKoppels--) this.poule.koppels.push(new RondeKoppel()); 
                this.poule.koppelIds.forEach((kplId, idx) => {
                    if (kplId != '') {
                        const foundKoppel = this.pouleRonde.koppels.find(kpl => kpl.kopId == kplId);
                        if (foundKoppel) {
                            this.poule.koppels[idx] = foundKoppel;
                        }
                    }
                });
                const splKopIdx = this.poule.koppels.findIndex(kpl => kpl.pouleKplId == splKopId);
                const tegKopIdx = this.poule.koppels.findIndex(kpl => kpl.pouleKplId == tegKopId);
                this.koppels.push(this.poule.koppels[splKopIdx]);
                this.koppels.push(this.poule.koppels[tegKopIdx]);
                this.splSpl = this.koppels[0].spelers[this.idxWed];
                this.tegSpl = this.koppels[1].spelers[this.idxWed];
                this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd Poule ${this.poule.id}`;
                this.createUitslagForm();
                if (this.getWedstrijden()) {
                    if (!this.viewMode) {
                        this.createUitslagForm();
                        this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd toevoegen Poule ${this.poule.id}`;
                    }
                    else {
                        this.lijsten = this.createScoreLijsten();
                    }

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

    private getWedstrijden(): boolean {
        let match = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
        if (match) {
            this.splMatch = match;
            this.matchVolgNr = this.splMatch.volgNr;
            this.splWed = this.splMatch.wedstrijden[this.idxWed];
            this.viewMode = this.splWed.uitslag.brt > 0;
        }
        else {
            this.alert.showError('Match gegevens speler 1 niet gevonden');
            return false;
        }
        match = this.koppels[1].matches.find(m => m.tegKoppelId == this.koppels[0].kopId);
        if (match) {
            this.tegMatch = match;
            this.tegWed = this.tegMatch.wedstrijden[this.idxWed];
        }
        else {
            this.alert.showError('Match gegevens speler 2 niet gevonden');
            return false;
        }
        return true;
    }

    private createScoreLijsten(): LijstSpeler[] {
        if (!this.splWed.uitslag.sco.length) {
            return [];
        }
        let result: LijstSpeler[] = [];
        if (this.splWed.metWit) {
            let spl = new LijstSpeler(this.koppels[0].spelers[this.idxWed]);
            spl.score = this.splWed.uitslag.sco;
            result.push(spl);
            spl = new LijstSpeler(this.koppels[1].spelers[this.idxWed]);
            spl.score = this.tegWed.uitslag.sco;
            result.push(spl);
        }
        else {
            let spl = new LijstSpeler(this.koppels[1].spelers[this.idxWed]);
            spl.score = this.tegWed.uitslag.sco;
            result.push(spl);
            spl = new LijstSpeler(this.koppels[0].spelers[this.idxWed]);
            spl.score = this.splWed.uitslag.sco;
            result.push(spl);
        }
        return result;
    }

    private uitslagToevoegen() {
        const splKoppel = this.koppels[0];
        const tegKoppel = this.koppels[1];
        // speler wedstrijd uitslag
        this.splWed.uitslag = new Uitslag();
        this.splWed.metWit = this.splWit?.value;
        this.splWed.uitslag.sco = [];
        this.splWed.uitslag.brt = this.ronde.rndBeurten;
        this.splWed.uitslag.car = this.splCar?.value;
        this.splWed.uitslag.moy = (this.splWed.uitslag.brt == 0) ? 0 : this.splWed.uitslag.car / this.splWed.uitslag.brt;
        this.setSpelerPunten(this.splWed.uitslag, this.splCar?.value, this.tegCar?.value, this.splWed.uitslag.moy, this.splSpl.splMoy);
        this.splWed.uitslag.ser = this.splSer?.value;
        // speler uitslagen
        splKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[this.idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, splKoppel.splUitslagen[this.idxWed].uitslag);
        });
        // speler match uitslag
        this.splMatch.datum = this.datum?.value;
        this.splMatch.uitslag = new Uitslag();
        this.splMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.splMatch.uitslag);
        });
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, splKoppel.uitslag);
        });
        // tegenstander wedstrijd uitslag
        this.tegWed.uitslag = new Uitslag();
        this.tegWed.metWit = this.tegWit?.value;
        this.tegWed.uitslag.sco = [];
        this.tegWed.uitslag.brt = this.ronde.rndBeurten;
        this.tegWed.uitslag.car = this.tegCar?.value;
        this.tegWed.uitslag.moy = (this.tegWed.uitslag.brt == 0) ? 0 : this.tegWed.uitslag.car / this.tegWed.uitslag.brt;
        this.setSpelerPunten(this.tegWed.uitslag, this.tegCar?.value, this.splCar?.value, this.tegWed.uitslag.moy, this.tegSpl.splMoy);
        this.tegWed.uitslag.ser = this.tegSer?.value;
        // tegenstander uitslagen
        tegKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[this.idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, tegKoppel.splUitslagen[this.idxWed].uitslag);
        });
        // tegenstander match uitslag
        this.tegMatch.datum = this.datum?.value;
        this.tegMatch.uitslag = new Uitslag();
        this.tegMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.tegMatch.uitslag);
        });
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, tegKoppel.uitslag);
        });
        // opslaan
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.pouleRonde));
        const pouleToSave: Poule = rondeToSave.poules[this.idxPoule];
        pouleToSave.koppelIds = pouleToSave.koppels.map(k => k.kopId);
        pouleToSave.koppels = [];
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.alert.showSuccess('Uitslag succesvol opgeslagen.');
            this.viewMode = true;
            this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd Poule ${this.poule.id}`;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private wedstrijdVerwijderen() {
        const splKoppel = this.koppels[0];
        const tegKoppel = this.koppels[1];
        // speler wedstrijd uitslag
        this.splWed.metWit = true;
        this.splWed.uitslag = new Uitslag();
        // speler uitslagen
        splKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[this.idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, splKoppel.splUitslagen[this.idxWed].uitslag);
        });
        // speler match uitslag
        this.splMatch.uitslag = new Uitslag();
        this.splMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.splMatch.uitslag);
        });
        if (this.splMatch.uitslag.brt == 0) {
            this.splMatch.datum = '';
        }
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, splKoppel.uitslag);
        });
        // tegenstander wedstrijd uitslag
        this.tegWed.metWit = true;
        this.tegWed.uitslag = new Uitslag();
        // tegenstander uitslagen
        tegKoppel.splUitslagen[this.idxWed].uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[this.idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, tegKoppel.splUitslagen[this.idxWed].uitslag);
        });
        // tegenstander match uitslag
        this.tegMatch.uitslag = new Uitslag();
        this.tegMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.tegMatch.uitslag);
        });
        if (this.tegMatch.uitslag.brt == 0) {
            this.tegMatch.datum = '';
        }
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, tegKoppel.uitslag);
        });
        // opslaan
        const rondeToSave: SpeelRonde = JSON.parse(JSON.stringify(this.pouleRonde));
        const pouleToSave: Poule = rondeToSave.poules[this.idxPoule];
        pouleToSave.koppelIds = pouleToSave.koppels.map(k => k.kopId);
        pouleToSave.koppels = [];
        this.dao.saveSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam, rondeToSave)
        .then(resp => {
            this.alert.showSuccess('Wedstrijd succesvol verwijderd.');
            this.escapePressed();
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
            datum: [this.splMatch.datum || this.today, [Validators.required, notEmpty(), validDateNotFuture()]],
            splWit: [this.splWed.metWit],
            splCar: [this.splWed.uitslag.car, [Validators.min(0), isIntegerNotNegative()]],
            splSer: [this.splWed.uitslag.ser, [Validators.min(0), isIntegerNotNegative()]],
            tegWit: [this.tegWed.metWit],
            tegCar: [this.tegWed.uitslag.car, [Validators.min(0), isIntegerNotNegative()]],
            tegSer: [this.tegWed.uitslag.ser, [Validators.min(0), isIntegerNotNegative()]],
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
