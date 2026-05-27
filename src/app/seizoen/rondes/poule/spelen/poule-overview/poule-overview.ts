import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { DateHelper } from '../../../../../services/date-helper';
import { Seizoen } from '../../../../../model/seizoen';
import { Poule, Ronde, SpeelRonde } from '../../../../../model/ronde';
import { RondeKoppel } from '../../../../../model/koppel';
import { DecimalPipe } from '@angular/common';
import { Button } from '../../../../../shared/button/button';
import { Btn } from '../../../../../model/misc';

@Component({
    selector: 'app-poule-overview',
    imports: [
        Button,
        DecimalPipe
    ],
    templateUrl: './poule-overview.html',
    styleUrl: './poule-overview.css',
})
export class PouleOverview extends Base implements OnInit {
    route = inject(ActivatedRoute);
    dater = inject(DateHelper);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleRonde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    poule: Poule = new Poule(0);
    today: string = '';
    allesGespeeld: boolean = false;

    btnSchema: Btn = new Btn('schema', 'Wedstrijd schema', 'enter');

    wedstrijdschemaClicked() {
        this.gotoPage(this.router.url + '/schema', this.router.url);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.btnSchema);
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
                this.header.subtitle = `Seizoen ${this.header.seizoen} - ${this.ronde.rndNaam} - Poule ${this.poule.id}`;
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
                if (btn.key.key == 'enter') {
                    this.wedstrijdschemaClicked();
                }
            }, 250);
        }, 250);
    }

    private pouleIsGestart(): boolean {
        return this.poule.koppels.some(k => k.uitslag.brt > 0);
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

}
