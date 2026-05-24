import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../model/seizoen';
import { Poule, Ronde } from '../../../model/ronde';
import { DateHelper } from '../../../services/date-helper';
import { Btn, Uitslag } from '../../../model/misc';
import { KoppelSpeler, LijstSpeler } from '../../../model/speler';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';
import { isIntegerNotNegative, notEmpty, validDateNotFuture, wedstrijdFormValidator } from '../../../directives/validators';
import { LijstView } from '../../../shared/lijst-view/lijst-view';
import { Button } from '../../../shared/button/button';
import { ConfirmDialogType } from '../../../model/dialogs';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-poule-ronde-wedstrijd',
    imports: [
        ReactiveFormsModule,
        LijstView,
        Button,
        ConfirmDialog,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './poule-ronde-wedstrijd.html',
    styleUrl: './poule-ronde-wedstrijd.css',
})
export class PouleRondeWedstrijd extends Base implements OnInit {
    // route = inject(ActivatedRoute);
    // fb = inject(FormBuilder);
    // dater = inject(DateHelper);
    // config: Seizoen = new Seizoen();
    // rondes: Ronde[] = [];
    // ronde: Ronde = new Ronde(0, '', '', 0, '');
    // pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    // poule: Poule = new Poule();
    // koppels: PouleKoppel[] = [];
    // splSpl: PouleKoppelSpeler = new PouleKoppelSpeler(new KoppelSpeler());
    // tegSpl: PouleKoppelSpeler = new PouleKoppelSpeler(new KoppelSpeler());
    // splWed: PouleKoppelWedstrijd = new PouleKoppelWedstrijd(new KoppelSpeler());
    // tegWed: PouleKoppelWedstrijd = new PouleKoppelWedstrijd(new KoppelSpeler());
    // lijsten: LijstSpeler[] = [];
    // confirmDelete: ConfirmDialogType = new ConfirmDialogType('Verwijder wedstrijd', ['Deze wedstrijd verwijderen.']);
    // matchVolgNr: number = 0;
    // today: string = '';
    // idxWed: number = -1;
    // viewMode: boolean = true;
    // dataReady: boolean = false;

    // btnSave: Btn = new Btn('save', 'Opslaan', 'enter');
    // btnDel: Btn = new Btn('del', 'Verwijder wedstrijd', 'enter');

    // uitslagForm!: FormGroup;

    // enterPressed() {
    //     if (this.viewMode) {
    //         this.buttonPressed(this.btnDel);
    //     }
    //     else {
    //         if (this.uitslagForm && this.uitslagForm.valid) {
    //             this.buttonPressed(this.btnSave);
    //         }
    //     }
    // }

    // opslaanClicked() {
    //     this.uitslagToevoegen();
    // }

    // verwijderenClicked() {
    //     this.confirmDelete.open = true;
    // }

    // confirmVerwijderenReplied(confirmed: boolean) {
    //     this.confirmDelete.open = false;
    //     if (confirmed) {
    //         this.wedstrijdVerwijderen();
    //     }
    // }

    // kleurClicked(idx: number) {
    //     if (idx == 0) {
    //         this.splWit?.setValue(!this.splWit.value);
    //         this.tegWit?.setValue(!this.splWit?.value);
    //     }
    //     else {
    //         this.tegWit?.setValue(!this.tegWit.value);
    //         this.splWit?.setValue(!this.tegWit?.value);
    //     }
    // }

    // @HostListener('document:keyup', ['$event'])
    // handleKeyboardEvent(event: KeyboardEvent): boolean {
    //     console.log(event.code + ' : ' + event.key);
    //     if (this.confirmDelete.open) {
    //         return false;
    //     }
    //     if (event.key === 'Enter') {
    //         this.enterPressed();
    //         return false;
    //     }
    //     if (event.key === 'Escape') {
    //         this.escapePressed();
    //         return false;
    //     }
    //     if (event.key === 'Home') {
    //         this.gotoHome();
    //         return false;
    //     }
    //     return true;
    // }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'scorebord';

    //     let id: string | null = this.route.snapshot.paramMap.get('rondeId');
    //     if (!id) {
    //         this.alert.showError('Kan ronde ID in URL niet vinden.');
    //         return;
    //     }
    //     const rondeId = Number(id);

    //     let idx: string | null = this.route.snapshot.paramMap.get('pouleIdx');
    //     if (!idx) {
    //         this.alert.showError('Kan poule index in URL niet vinden.');
    //         return;
    //     }
    //     const pouleIdx = Number(idx);

    //     id = this.route.snapshot.paramMap.get('splKopId');
    //     if (!id) {
    //         this.alert.showError('Kan ID koppel 1 in URL niet vinden.');
    //         return;
    //     }
    //     const splKopId = id;

    //     id = this.route.snapshot.paramMap.get('tegKopId');
    //     if (!id) {
    //         this.alert.showError('Kan ID koppel 2 in URL niet vinden.');
    //         return;
    //     }
    //     const tegKopId = id;
        
    //     idx = this.route.snapshot.paramMap.get('wedIdx');
    //     if (!idx) {
    //         this.alert.showError('Kan wedstrijd index in URL niet vinden.');
    //         return;
    //     }
    //     const wedIdx = Number(idx);
        
    //     Promise.all([
    //         this.dao.getSeizoenFile(this.header.seizoen),
    //         this.dao.getRondes(this.header.seizoen),
    //         this.dao.getWedstrijd()
    //     ])
    //     .then(results => {
    //         this.config = results[0];
    //         this.rondes = results[1];
    //         const idxRonde = this.rondes.findIndex(rnd => rnd.rndId == rondeId);
    //         if (idxRonde < 0) {
    //             this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
    //             return;
    //         }
    //         this.ronde = this.rondes[idxRonde];
    //         this.today = new Date().toISOString().substring(0, 10);
    //         this.header.datum = this.dater.dateReverse(this.today);
    //         this.idxWed = wedIdx;
    //         this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
    //         .then(data => {
    //             this.pouleRonde = data;
    //             this.poule = this.pouleRonde.poules[pouleIdx];
    //             const splKopIdx = this.poule.pouleKoppels.findIndex(kpl => kpl.id == splKopId);
    //             const tegKopIdx = this.poule.pouleKoppels.findIndex(kpl => kpl.id == tegKopId);
    //             this.koppels.push(this.poule.pouleKoppels[splKopIdx]);
    //             this.koppels.push(this.poule.pouleKoppels[tegKopIdx]);
    //             this.splSpl = this.koppels[0].spelers[this.idxWed];
    //             this.tegSpl = this.koppels[1].spelers[this.idxWed];
    //             this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd Poule ${this.poule.pouleId}`;
    //             this.createUitslagForm();
    //             if (this.getWedstrijden()) {
    //                 if (!this.viewMode) {
    //                     this.createUitslagForm();
    //                     this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd toevoegen Poule ${this.poule.pouleId}`;
    //                 }
    //                 else {
    //                     this.lijsten = this.createScoreLijsten();
    //                 }

    //             }
    //             this.dataReady = true;
    //         })
    //         .catch(err => {
    //             this.alert.showError(err);
    //         });
    //     })
    //     .catch(err => {
    //         this.alert.showError(err);
    //     });
    }

    // private buttonPressed(btn: Btn) {
    //     btn.clicked = true;
    //     setTimeout(() => {
    //         btn.clicked = false;
    //         setTimeout(() => {
    //             if (btn.id == 'save') {
    //                 this.opslaanClicked();
    //             }
    //             else if (btn.id == 'del') {
    //                 this.verwijderenClicked();
    //             }
    //         }, 250);
    //     }, 250);
    // }

    // private getWedstrijden(): boolean {
    //     let wed = this.koppels[0].spelers[this.idxWed].wedstrijden.find(wd => wd.tegPouleKoppelId == this.koppels[1].id);
    //     if (wed) {
    //         this.matchVolgNr = wed.volgNr;
    //         this.viewMode = wed.uitslag.brt > 0;
    //         this.splWed = wed;
    //     }
    //     else {
    //         this.alert.showError('Wedstrijd gegevens speler 1 niet gevonden');
    //         return false;
    //     }
    //     wed = this.koppels[1].spelers[this.idxWed].wedstrijden.find(wd => wd.tegPouleKoppelId == this.koppels[0].id);
    //     if (wed) {
    //         this.tegWed = wed;
    //     }
    //     else {
    //         this.alert.showError('Wedstrijd gegevens speler 2 niet gevonden');
    //         return false;
    //     }
    //     return true;
    // }

    // createScoreLijsten(): LijstSpeler[] {
    //     if (!this.splWed.score.length) {
    //         return [];
    //     }
    //     let result: LijstSpeler[] = [];
    //     if (this.splWed.metWit) {
    //         let spl = new LijstSpeler(this.koppels[0].spelers[this.idxWed].speler);
    //         spl.score = this.splWed.score;
    //         result.push(spl);
    //         spl = new LijstSpeler(this.koppels[1].spelers[this.idxWed].speler);
    //         spl.score = this.tegWed.score;
    //         result.push(spl);
    //     }
    //     else {
    //         let spl = new LijstSpeler(this.koppels[1].spelers[this.idxWed].speler);
    //         spl.score = this.tegWed.score;
    //         result.push(spl);
    //         spl = new LijstSpeler(this.koppels[0].spelers[this.idxWed].speler);
    //         spl.score = this.splWed.score;
    //         result.push(spl);
    //     }
    //     return result;
    // }

    // private uitslagToevoegen() {
    //     const splKoppel = this.koppels[0];
    //     const tegKoppel = this.koppels[1];
    //     // speler wedstrijd uitslag
    //     this.splWed.metWit = this.splWit?.value;
    //     this.splWed.score = [];
    //     this.splWed.wedDatum = this.datum?.value;
    //     this.splWed.uitslag.brt = this.ronde.rndBeurten;
    //     this.splWed.uitslag.car = this.splCar?.value;
    //     this.splWed.uitslag.moy = (this.splWed.uitslag.brt == 0) ? 0 : this.splWed.uitslag.car / this.splWed.uitslag.brt;
    //     this.splWed.uitslag.pnt = this.getSpelerPunten(this.splCar?.value, this.tegCar?.value, this.splWed.uitslag.moy, this.splSpl.speler.splMoy);
    //     this.splWed.uitslag.ser = this.splSer?.value;
    //     // speler uitslag
    //     this.splSpl.uitslag = new Uitslag();
    //     this.splSpl.wedstrijden.forEach(wd => {
    //         this.splSpl.uitslag.brt += wd.uitslag.brt;
    //         this.splSpl.uitslag.car += wd.uitslag.car;
    //         this.splSpl.uitslag.pnt += wd.uitslag.pnt;
    //         if (wd.uitslag.ser > this.splSpl.uitslag.ser) {
    //             this.splSpl.uitslag.ser = wd.uitslag.ser;
    //         }
    //     });
    //     this.splSpl.uitslag.moy = (this.splSpl.uitslag.brt == 0) ? 0 : this.splSpl.uitslag.car / this.splSpl.uitslag.brt;
    //     // speler koppel uitslag
    //     splKoppel.uitslag = new Uitslag();
    //     splKoppel.spelers.forEach(ks => {
    //         splKoppel.uitslag.brt += ks.uitslag.brt;
    //         splKoppel.uitslag.car += ks.uitslag.car;
    //         splKoppel.uitslag.pnt += ks.uitslag.pnt;
    //         if (ks.uitslag.ser > splKoppel.uitslag.ser) {
    //             splKoppel.uitslag.ser = ks.uitslag.ser;
    //         }
    //     });
    //     splKoppel.uitslag.moy = (splKoppel.uitslag.brt == 0) ? 0 : splKoppel.uitslag.car / splKoppel.uitslag.brt;
    //     // tegenstander wedstrijd uitslag
    //     this.tegWed.metWit = this.tegWit?.value;
    //     this.tegWed.score = [];
    //     this.tegWed.wedDatum = this.datum?.value;
    //     this.tegWed.uitslag.brt = this.ronde.rndBeurten;
    //     this.tegWed.uitslag.car = this.tegCar?.value;
    //     this.tegWed.uitslag.moy = (this.tegWed.uitslag.brt == 0) ? 0 : this.tegWed.uitslag.car / this.tegWed.uitslag.brt;
    //     this.tegWed.uitslag.pnt = this.getSpelerPunten(this.tegCar?.value, this.splCar?.value, this.tegWed.uitslag.moy, this.tegSpl.speler.splMoy);
    //     this.tegWed.uitslag.ser = this.tegSer?.value;
    //     // tegenstander uitslag
    //     this.tegSpl.uitslag = new Uitslag();
    //     this.tegSpl.wedstrijden.forEach(wd => {
    //         this.tegSpl.uitslag.brt += wd.uitslag.brt;
    //         this.tegSpl.uitslag.car += wd.uitslag.car;
    //         this.tegSpl.uitslag.pnt += wd.uitslag.pnt;
    //         if (wd.uitslag.ser > this.tegSpl.uitslag.ser) {
    //             this.tegSpl.uitslag.ser = wd.uitslag.ser;
    //         }
    //     });
    //     this.tegSpl.uitslag.moy = (this.tegSpl.uitslag.brt == 0) ? 0 : this.tegSpl.uitslag.car / this.tegSpl.uitslag.brt;
    //     // tegenstander koppel uitslag
    //     tegKoppel.uitslag = new Uitslag();
    //     tegKoppel.spelers.forEach(ks => {
    //         tegKoppel.uitslag.brt += ks.uitslag.brt;
    //         tegKoppel.uitslag.car += ks.uitslag.car;
    //         tegKoppel.uitslag.pnt += ks.uitslag.pnt;
    //         if (ks.uitslag.ser > tegKoppel.uitslag.ser) {
    //             tegKoppel.uitslag.ser = ks.uitslag.ser;
    //         }
    //     });
    //     tegKoppel.uitslag.moy = (tegKoppel.uitslag.brt == 0) ? 0 : tegKoppel.uitslag.car / tegKoppel.uitslag.brt;
    //     // opslaan
    //     this.dao.savePouleRondeFile(this.header.seizoen, this.ronde.fileNaam, this.pouleRonde)
    //     .then(resp => {
    //         this.alert.showSuccess('Uitslag succesvol opgeslagen.');
    //         this.viewMode = true;
    //         this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijd Poule ${this.poule.pouleId}`;
    //     })
    //     .catch(err => {
    //         this.alert.showError(err);
    //     });
    // }

    // private wedstrijdVerwijderen() {
    //     const splKoppel = this.koppels[0];
    //     const tegKoppel = this.koppels[1];
    //     // speler wedstrijd uitslag
    //     this.splWed.metWit = true;
    //     this.splWed.score = [];
    //     this.splWed.wedDatum = '';
    //     this.splWed.uitslag = new Uitslag();
    //     // speler uitslag
    //     this.splSpl.uitslag = new Uitslag();
    //     this.splSpl.wedstrijden.forEach(wd => {
    //         this.splSpl.uitslag.brt += wd.uitslag.brt;
    //         this.splSpl.uitslag.car += wd.uitslag.car;
    //         this.splSpl.uitslag.pnt += wd.uitslag.pnt;
    //         if (wd.uitslag.ser > this.splSpl.uitslag.ser) {
    //             this.splSpl.uitslag.ser = wd.uitslag.ser;
    //         }
    //     });
    //     this.splSpl.uitslag.moy = (this.splSpl.uitslag.brt == 0) ? 0 : this.splSpl.uitslag.car / this.splSpl.uitslag.brt;
    //     // speler koppel uitslag
    //     splKoppel.uitslag = new Uitslag();
    //     splKoppel.spelers.forEach(ks => {
    //         splKoppel.uitslag.brt += ks.uitslag.brt;
    //         splKoppel.uitslag.car += ks.uitslag.car;
    //         splKoppel.uitslag.pnt += ks.uitslag.pnt;
    //         if (ks.uitslag.ser > splKoppel.uitslag.ser) {
    //             splKoppel.uitslag.ser = ks.uitslag.ser;
    //         }
    //     });
    //     splKoppel.uitslag.moy = (splKoppel.uitslag.brt == 0) ? 0 : splKoppel.uitslag.car / splKoppel.uitslag.brt;
    //     // tegenstander wedstrijd uitslag
    //     this.tegWed.metWit = true;
    //     this.tegWed.score = [];
    //     this.tegWed.wedDatum = '';
    //     this.tegWed.uitslag = new Uitslag();
    //     // tegenstander uitslag
    //     this.tegSpl.uitslag = new Uitslag();
    //     this.tegSpl.wedstrijden.forEach(wd => {
    //         this.tegSpl.uitslag.brt += wd.uitslag.brt;
    //         this.tegSpl.uitslag.car += wd.uitslag.car;
    //         this.tegSpl.uitslag.pnt += wd.uitslag.pnt;
    //         if (wd.uitslag.ser > this.tegSpl.uitslag.ser) {
    //             this.tegSpl.uitslag.ser = wd.uitslag.ser;
    //         }
    //     });
    //     this.tegSpl.uitslag.moy = (this.tegSpl.uitslag.brt == 0) ? 0 : this.tegSpl.uitslag.car / this.tegSpl.uitslag.brt;
    //     // tegenstander koppel uitslag
    //     tegKoppel.uitslag = new Uitslag();
    //     tegKoppel.spelers.forEach(ks => {
    //         tegKoppel.uitslag.brt += ks.uitslag.brt;
    //         tegKoppel.uitslag.car += ks.uitslag.car;
    //         tegKoppel.uitslag.pnt += ks.uitslag.pnt;
    //         if (ks.uitslag.ser > tegKoppel.uitslag.ser) {
    //             tegKoppel.uitslag.ser = ks.uitslag.ser;
    //         }
    //     });
    //     tegKoppel.uitslag.moy = (tegKoppel.uitslag.brt == 0) ? 0 : tegKoppel.uitslag.car / tegKoppel.uitslag.brt;
    //     // opslaan
    //     this.dao.savePouleRondeFile(this.header.seizoen, this.ronde.fileNaam, this.pouleRonde)
    //     .then(resp => {
    //         this.alert.showSuccess('Wedstrijd succesvol verwijderd.');
    //         this.escapePressed();
    //     })
    //     .catch(err => {
    //         this.alert.showError(err);
    //     });
    // }

    // private getSpelerPunten(carSpl: number, carTeg: number, gsMoy: number, tsMoy: number): number {
    //     let punten = 0;
    //     if (carSpl > carTeg) {
    //         punten = this.config.pntWinst;
    //     }
    //     else if (carSpl == carTeg) {
    //         punten = this.config.pntGelijk;
    //     }
    //     if (gsMoy > tsMoy) {
    //         punten += this.config.pntMoyenne;
    //     }
    //     return punten;
    // }

    // private createUitslagForm() {
    //     this.uitslagForm =  this.fb.nonNullable.group({
    //         datum: [this.splWed.wedDatum || this.today, [Validators.required, notEmpty(), validDateNotFuture()]],
    //         splWit: [this.splWed.metWit],
    //         splCar: [this.splWed.uitslag.car, [Validators.min(0), isIntegerNotNegative()]],
    //         splSer: [this.splWed.uitslag.ser, [Validators.min(0), isIntegerNotNegative()]],
    //         tegWit: [this.tegWed.metWit],
    //         tegCar: [this.tegWed.uitslag.car, [Validators.min(0), isIntegerNotNegative()]],
    //         tegSer: [this.tegWed.uitslag.ser, [Validators.min(0), isIntegerNotNegative()]],
    //         beurten: [this.ronde.rndBeurten]
    //     }, { validators: wedstrijdFormValidator });
    //     if (!this.viewMode) {
    //         this.uitslagForm.get('datum')?.setValue(this.today);
    //         this.uitslagForm.get('splWit')?.setValue(true);
    //         this.uitslagForm.get('tegWit')?.setValue(true);
    //     }
    // }

    // get datum() {
    //     return this.uitslagForm?.get('datum');
    // }
    // get splWit() {
    //     return this.uitslagForm?.get('splWit');
    // }
    // get splCar() {
    //     return this.uitslagForm?.get('splCar');
    // }
    // get splSer() {
    //     return this.uitslagForm?.get('splSer');
    // }
    // get tegWit() {
    //     return this.uitslagForm?.get('tegWit');
    // }
    // get tegCar() {
    //     return this.uitslagForm?.get('tegCar');
    // }
    // get tegSer() {
    //     return this.uitslagForm?.get('tegSer');
    // }
    
}
