import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../services/date-helper';
import { Seizoen } from '../../../model/seizoen';
import { Poule, PouleKoppel, PouleKoppelWedstrijd, PouleRonde, Ronde, Uitslag } from '../../../model/ronde';
import { Koppel } from '../../../model/koppel';
import { Btn } from '../../../model/misc';
import { Button } from '../../../shared/button/button';
import { DecimalPipe, NgClass } from '@angular/common';

class KoppelUitslag {
    splUitslagen: Uitslag[] = [];
}

@Component({
    selector: 'app-poule-ronde-match',
    imports: [
        Button,
        NgClass,
        DecimalPipe
    ],
    templateUrl: './poule-ronde-match.html',
    styleUrl: './poule-ronde-match.css',
})
export class PouleRondeMatch extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    poule: Poule = new Poule();
    koppels: PouleKoppel[] = [];
    idxKop: number = -1;
    kopUitslagen: KoppelUitslag[] = [];
    idxWed: number = -1;
    today: string = '';

    btnWed: Btn = new Btn('wed', 'Naar wedstrijd');

    override escapePressed(): void {
        if (this.idxWed >= 0) {
            this.idxWed = -1;
            this.btnWed.text = 'Naar wedstrijd';
            return;
        }
        super.escapePressed();
    }

    enterPressed() {
        if (this.idxWed >= 0) {
            this.naarWedstrijdClicked();
        }
    }

    wedstrijdNrPressed(nr: number) {
        this.wedstrijdClicked(nr - 1);
    }

    naarWedstrijdClicked() {
        console.log(this.router.url + '/' + this.idxWed);
        this.gotoPage(this.router.url + '/' + this.idxWed, this.router.url);
    }

    wedstrijdClicked(idx: number) {
        this.selectWedstrijd(idx);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.moveUp();
            }
            if (event.key === 'ArrowDown') {
                this.moveDown();
            }
            return false;
        }
        if (event.key >= '1' && event.key <= '2') {
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

        idx = this.route.snapshot.paramMap.get('splIdx');
        if (!idx) {
            this.alert.showError('Kan speler index in URL niet vinden.');
            return;
        }
        const splIdx = Number(idx);

        idx = this.route.snapshot.paramMap.get('tegIdx');
        if (!idx) {
            this.alert.showError('Kan tegenstander index in URL niet vinden.');
            return;
        }
        const tegIdx = Number(idx);

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
            this.dao.getPouleRondeFile(this.header.seizoen, this.ronde.fileNaam)
            .then(data => {
                this.pouleRonde = data;
                this.poule = this.pouleRonde.poules[pouleIdx];
                this.koppels[0] = this.poule.pouleKoppels[splIdx];
                this.koppels[1] = this.poule.pouleKoppels[tegIdx];
                this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} match Poule ${this.poule.pouleId} : koppel ${this.koppels[0].id} - koppel ${this.koppels[1].id}`;
                this.koppels.forEach((koppel, idxKop) => {
                    let kopUitslag: KoppelUitslag = new KoppelUitslag();
                    this.kopUitslagen.push(kopUitslag);
                    koppel.spelers.forEach((speler, splIdx) => {
                        let uitslag = new Uitslag();
                        const idx = speler.wedstrijden.findIndex(wed => wed.tegPouleKoppelId == this.koppels[Math.abs(idxKop - 1)].id);
                        if (idx >= 0) {
                            uitslag = speler.wedstrijden[idx].uitslag;
                        }
                        else {
                            if (splIdx == 0) {
                                this.selectWedstrijd(0);
                            }
                            else if (this.idxWed < 0) {
                                this.selectWedstrijd(1);
                            }
                        }
                        kopUitslag.splUitslagen.push(uitslag);
                    });
                });
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private moveUp() {
        if (this.idxWed <= 0) {
            this.selectWedstrijd(1);
        }
        else {
            this.selectWedstrijd(this.idxWed - 1);
        }
    }

    private moveDown() {
        if (this.idxWed >= 1) {
            this.selectWedstrijd(0);
        }
        else {
            this.selectWedstrijd(this.idxWed + 1);
        }
    }

    private selectWedstrijd(idx: number) {
        this.idxWed = idx;
        const spl = this.koppels[0].spelers[idx].speler.splBNaam;
        const teg = this.koppels[1].spelers[idx].speler.splBNaam;
        this.btnWed.text = 'Naar wedstrijd ' + (idx + 1) + ' : ' + spl + ' - ' + teg;
    }

}
