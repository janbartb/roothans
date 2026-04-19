import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../services/date-helper';
import { Poule, PouleKoppel, PouleKoppelWedstrijd, PouleRonde, PouleSchema, PouleSchemaWedstrijd, Ronde } from '../../../../model/ronde';
import { Seizoen } from '../../../../model/seizoen';
import { DecimalPipe, NgClass } from '@angular/common';

interface IData {
	[ key: string ]: any;
}

@Component({
    selector: 'app-poule-ronde-spelen-poule',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './poule-ronde-spelen-poule.html',
    styleUrl: './poule-ronde-spelen-poule.css',
})
export class PouleRondeSpelenPoule extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    poule: Poule = new Poule();
    idxPoule: number = -1;
    today: string = '';
    idxRow: number = 0;
    idxCol: number = 0;
    allesGespeeld: boolean = false;
    matchToNrs: IData = {
        m01 : 1,
        m10 : 1,
        m23 : 2,
        m32 : 2,
        m02 : 3,
        m20 : 3,
        m13 : 4,
        m31 : 4,
        m03 : 5,
        m30 : 5,
        m12 : 6,
        m21 : 6
    };
    nrsToMatch: string[] = ['01', '23', '02', '13', '03', '12'];

    override escapePressed(): void {
        if (this.idxRow > 0 || this.idxCol > 0) {
            this.idxRow = this.idxCol = 0;
            this.setEersteTeSpelenMatch();
            return;
        }
        super.escapePressed();
    }

    enterPressed() {
        if (this.idxRow == 0 && this.idxCol == 0) {
            return;
        }
        this.matchClicked(this.idxRow, this.idxCol);
    }

    wedstrijdNrPressed(nr: number) {
        const match = this.nrsToMatch[nr - 1];
        this.matchClicked(Number(match.substring(0,1)), Number(match.substring(1)));
    }

    matchClicked(idxR: number, idxC: number) {
        if (idxR == idxC) {
            return;
        }
        this.gotoPage(`${this.router.url}/match/${idxR}/${idxC}`, this.router.url);
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Wedstrijden`;

        const rondeId: string | null = this.route.snapshot.paramMap.get('rondeId');
        if (!rondeId) {
            this.alert.showError('Kan ronde ID in URL niet vinden.');
            return;
        }
        const id = Number(rondeId);

        const index: string | null = this.route.snapshot.paramMap.get('pouleIdx');
        if (!rondeId) {
            this.alert.showError('Kan poule index in URL niet vinden.');
            return;
        }
        const idx = Number(index);

        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen)
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            const idxRonde = this.rondes.findIndex(rnd => rnd.rndId == id);
            if (idxRonde < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            this.ronde = this.rondes[idxRonde];
            this.today = new Date().toISOString().substring(0, 10);
            this.header.datum = this.dater.dateReverse(this.today);
            this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.idxPoule = idx;
                this.poule = this.pouleRonde.poules[this.idxPoule];
                this.poule.pouleKoppels.sort(this.comparePouleKoppels);
                this.setWedstrijdenEnVolgorde();
                this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} wedstrijden Poule ${this.poule.pouleId}`;
                this.setEersteTeSpelenMatch();
                this.allesGespeeld = this.alleWedstrijdenGespeeld();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private setWedstrijdenEnVolgorde() {
        this.poule.pouleKoppels.forEach((splKop, idxSK) => {
            if (splKop.spelers[0].wedstrijden.length == 0) {
                this.poule.pouleKoppels.forEach((tegKop, idxTK) => {
                    if (idxSK != idxTK) {
                        const wedVolgNr = this.matchToNrs['m' + idxSK + idxTK];
                        splKop.spelers.forEach((spl, idxS) => {
                            const wed = new PouleKoppelWedstrijd(tegKop.koppel.spelers[idxS]);
                            wed.volgNr = wedVolgNr;
                            wed.tegPouleKoppelId = tegKop.id;
                            spl.wedstrijden.push(wed);
                        });
                    }
                });
            }
        });
    }

    private alleWedstrijdenGespeeld(): boolean {
        return this.poule.pouleKoppels.every(pk => {
            return pk.spelers.every(spl => {
                return spl.wedstrijden.every(wed => wed.uitslag.brt > 0);
            });
        });
    }

    private setEersteTeSpelenMatch() {
        this.idxRow = this.idxCol = 0;
        let firstVolgNr = 100;
        this.poule.pouleKoppels.forEach((splKop, idxSK) => {
            this.poule.pouleKoppels.forEach((tegKop, idxTK) => {
                splKop.spelers.forEach(spl => {
                    spl.wedstrijden.forEach(wed => {
                        if (wed.uitslag.brt == 0 && wed.volgNr < firstVolgNr) {
                            firstVolgNr = wed.volgNr;
                            this.idxRow = idxSK;
                            this.idxCol = idxTK;
                        }
                    });
                });
            });
        });
    }

    private comparePouleKoppels(a: PouleKoppel, b: PouleKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
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
