import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { RondeKoppel } from '../../../../../model/koppel';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-poule-schema',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './poule-schema.html',
    styleUrl: './poule-schema.css',
})
export class PouleSchema extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    poule: Poule = new Poule(0);
    today: string = '';
    idxRow: number = 0;
    idxCol: number = 0;
    allesGespeeld: boolean = false;
    eerstVolgendeMatchNr: number = 0;
    selectedMatchNr: number = 0;

    enterPressed() {
        if (this.idxRow == 0 && this.idxCol == 0) {
            return;
        }
        this.matchClicked(this.idxRow, this.idxCol);
    }

    wedstrijdNrPressed(nr: number) {
        let idxSpl = 0;
        let idxTeg = 0;
        this.poule.koppels.forEach((splKop, idxS) => {
            splKop.matches.forEach(match => {
                if (match.volgNr == nr) {
                    idxSpl = idxS;
                    idxTeg = this.poule.koppels.findIndex(kpl => kpl.kopId == match.tegKoppelId);
                }
            });
        })
        this.matchClicked(idxTeg, idxSpl);
    }

    matchClicked(idxR: number, idxC: number) {
        if (idxR == idxC) {
            return;
        }
        const kopSplId = this.poule.koppels[idxR].kopId;
        const kopTegId = this.poule.koppels[idxC].kopId;
        this.gotoPage(`${this.router.url}/match/${kopSplId}/${kopTegId}`, this.router.url);
    }

    getWedstrijdNrMatch(idxSpl: number, idxTeg: number): number {
        const splKoppel = this.poule.koppels[idxSpl];
        const tegKoppelId = this.poule.koppels[idxTeg].kopId;
        const match = splKoppel.matches.find(m => m.tegKoppelId == tegKoppelId);
        return match ? match.volgNr : 0;
    }

    getWedstrijdNrNietGespeeldeMatch(idxSpl: number, idxTeg: number): number {
        const splKoppel = this.poule.koppels[idxSpl];
        const tegKoppelId = this.poule.koppels[idxTeg].kopId;
        const match = splKoppel.matches.find(m => m.tegKoppelId == tegKoppelId);
        if (!match) {
            return 0;
        }
        const wed1 = match.wedstrijden[0];
        if (!wed1) {
            return 0;
        }
        const wed2 = match.wedstrijden[1];
        if (!wed2) {
            return 0;
        }
        if (wed1.uitslag.brt > 0 || wed2.uitslag.brt > 0) {
            return 0;
        }
        return match.volgNr;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (event.key === 'ArrowUp') {
                this.moveUp();
            }
            if (event.key === 'ArrowDown') {
                this.moveDown();
            }
            if (event.key === 'ArrowLeft') {
                this.moveLeft();
            }
            if (event.key === 'ArrowRight') {
                this.moveRight();
            }
            this.selectedMatchNr = this.getSelectedMatchNr();
            return false;
        }
        if (event.key >= '1' && event.key <= '6') {
            this.wedstrijdNrPressed(Number(event.key));
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Poule`;
        
        const id: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!id) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const rondeId = Number(id);

        const index: string | null = this.route.snapshot.paramMap.get('pouleIdx');
        if (!rondeId) {
            this.alert.showError('Kan poule index in URL niet vinden.');
            return;
        }
        const pouleIdx = Number(index);
        
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen)
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
            this.dao.getSpeelRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.poule = this.pouleRonde.poules[pouleIdx];
                this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Wedstrijdschema poule ${this.poule.id}`;
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
                if (this.pouleIsGestart()) {
                    this.poule.koppels.sort(this.comparePouleKoppels);
                }
                this.allesGespeeld = this.alleWedstrijdenGespeeld();
                if (!this.allesGespeeld) {
                    this.eerstVolgendeMatchNr = this.setEersteTeSpelenMatch();
                    this.selectedMatchNr = this.eerstVolgendeMatchNr;
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private pouleIsGestart(): boolean {
        return this.poule.koppels.some(k => k.uitslag.brt > 0);
    }

    private alleWedstrijdenGespeeld(): boolean {
        return this.poule.koppels.every(pk => {
            return pk.matches.every(match => {
                return match.wedstrijden.every(wed => wed.uitslag.brt > 0);
            });
        });
    }

    private setEersteTeSpelenMatch(): number {
        this.idxRow = this.idxCol = 0;
        let firstVolgNr = 100;
        this.poule.koppels.forEach((splKop, idxSK) => {
            this.poule.koppels.forEach((tegKop, idxTK) => {
                splKop.matches.forEach(match => {
                    match.wedstrijden.forEach(wed => {
                        if (wed.tegKoppelId == tegKop.kopId && wed.uitslag.brt == 0 && match.volgNr < firstVolgNr) {
                            firstVolgNr = match.volgNr;
                            this.idxRow = idxSK;
                            this.idxCol = idxTK;
                        }
                    });
                });
            });
        });
        return firstVolgNr;
    }

    private comparePouleKoppels(a: RondeKoppel, b: RondeKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            if ((b.uitslag.moy / b.kopMoyenne) == (a.uitslag.moy / a.kopMoyenne)) {
                return b.kopMoyenne - a.kopMoyenne;
            }
            else {
                return (b.uitslag.moy / b.kopMoyenne) - (a.uitslag.moy / a.kopMoyenne);
            }
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
        }
    }

    private getSelectedMatchNr(): number {
        const splKoppel = this.poule.koppels[this.idxRow];
        const tegKoppelId = this.poule.koppels[this.idxCol].kopId;
        const match = splKoppel.matches.find(m => m.tegKoppelId == tegKoppelId);
        if (match) {
            return match.volgNr;
        }
        else {
            return this.eerstVolgendeMatchNr;
        }
    }

    private moveUp() {
        this.idxRow--;
        if (this.idxRow < 0) {
            this.idxRow = 3;
        }
        if (this.idxRow == this.idxCol) {
            this.moveUp();
        }
    }
    
    private moveDown() {
        this.idxRow++;
        if (this.idxRow > 3) {
            this.idxRow = 0;
        }
        if (this.idxRow == this.idxCol) {
            this.moveDown();
        }
    }
    
    private moveLeft() {
        this.idxCol--;
        if (this.idxCol < 0) {
            this.idxCol = 3;
        }
        if (this.idxRow == this.idxCol) {
            this.moveLeft();
        }
    }
    
    private moveRight() {
        this.idxCol++;
        if (this.idxCol > 3) {
            this.idxCol = 0;
        }
        if (this.idxRow == this.idxCol) {
            this.moveRight();
        }
    }

}
