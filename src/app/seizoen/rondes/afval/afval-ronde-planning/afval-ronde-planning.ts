import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { ActivatedRoute } from '@angular/router';
import { Seizoen } from '../../../../model/seizoen';
import { AfvalKoppel, AfvalRonde, Poule, PouleRonde, Ronde, RondeKoppel } from '../../../../model/ronde';
import { Koppel } from '../../../../model/koppel';
import { KoppelSpeler } from '../../../../model/speler';

class KoppelsPerDag {
    dagNr: number = 0;
    dagNaam: string = '';
    koppelsFirst: AfvalKoppel[] = [];
    koppelsSecond: AfvalKoppel[] = [];
    koppelsRest: AfvalKoppel[] = [];
    idxFirst: number = -1;
    idxSecond: number = -1;
    idxRest: number = -1;
}

@Component({
    selector: 'app-afval-ronde-planning',
    imports: [],
    templateUrl: './afval-ronde-planning.html',
    styleUrl: './afval-ronde-planning.css',
})
export class AfvalRondePlanning extends Base implements OnInit {
    route = inject(ActivatedRoute);
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    ronde: AfvalRonde = new AfvalRonde(0, '', 0, '');
    prevAfvalRonde: AfvalRonde = new AfvalRonde(0, '', 0, '');
    prevPouleRonde: PouleRonde = new PouleRonde(0, '', 0, '');
    tePlannenKoppels: AfvalKoppel[] = [];
    koppelsPerDagen: KoppelsPerDag[] = [];
    prevRondeBeurtenFinished: number = 0;

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
            this.dao.getRondes(this.header.seizoen),
            // this.dao.getKoppels(this.header.seizoen)
        ])
        .then(results => {
            this.config = results[0];
            this.rondes = results[1];
            // this.koppels = results[2];
            // this.koppels.sort(this.compareKoppels);
            const idx = this.rondes.findIndex(rnd => rnd.rndId == id);
            if (idx < 0) {
                this.alert.showError(`Ronde met ID '${id}' niet gevonden.`);
                return;
            }
            const rnd = this.rondes[idx];
            const rndPrev = this.rondes[idx - 1];
            this.header.subtitle = `Seizoen ${this.header.seizoen} - Planning ${rnd.rndNaam}`;
            Promise.all([
                this.dao.getAfvalRondeFile(this.header.seizoen, rnd.fileNaam),
                (idx == 1 ? this.dao.getPouleRondeFile(this.header.seizoen, rndPrev.fileNaam) : this.dao.getAfvalRondeFile(this.header.seizoen, rndPrev.fileNaam))
            ])
            .then(rndFiles => {
                this.ronde = rndFiles[0];
                if (idx == 1) {
                    this.prevPouleRonde = <PouleRonde>rndFiles[1];
                    this.prevRondeBeurtenFinished = 6 * rndPrev.rndBeurten;
                    this.tePlannenKoppels = this.getTePlannenKoppelsFromPouleRonde();
                }
                else {
                    this.prevAfvalRonde = <AfvalRonde>rndFiles[1];
                    this.prevRondeBeurtenFinished = 2 * rndPrev.rndBeurten;
                    this.tePlannenKoppels = this.getTePlannenKoppelsFromAfvalRonde();
                }
                console.log(this.tePlannenKoppels);
                // this.fillKoppelsPerDagen();
                // if (!this.pouleRonde.poules) {
                //     this.pouleRonde.poules = [];
                // }
                // this.pouleRonde.poules.forEach(poule => {
                //     poule.pouleVolgNr = 0;
                //     poule.pouleId = '';
                //     poule.pouleKoppels.forEach(pkop => {
                //         this.removeKoppelFromKoppelsPerDagen(pkop.koppel);
                //     });
                // });
                // this.maxPoules = this.config.maxKoppels / this.config.maxKoppelsPerPoule;
                // this.poulesOk = this.allPoulesFilled();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private getTePlannenKoppelsFromPouleRonde(): AfvalKoppel[] {
        let result: AfvalKoppel[] = [];
        this.prevPouleRonde.poules.forEach(poule => {
            if (poule.pouleKoppels.every(pk => pk.uitslag.brt == this.prevRondeBeurtenFinished)) {
                result.push(...this.getAfvalKoppelsFromPoule(poule));
            }
        });
        return result;
    }

    private getTePlannenKoppelsFromAfvalRonde(): AfvalKoppel[] {
        let result: AfvalKoppel[] = [];

        return result;        
    }

    getAfvalKoppelsFromPoule(pl: Poule): AfvalKoppel[] {
        let result: AfvalKoppel[] = [];
        pl.pouleKoppels.sort(this.comparePouleKoppels);
        pl.pouleKoppels.forEach((kpl, idx) => {
            let kop = new AfvalKoppel();
            kop.id = kpl.koppel.kopId;
            kop.koppel = kpl.koppel;
            kop.koppel.kopMoyenne = kpl.uitslag.moy;
            kop.pouleId = pl.pouleId;
            kop.pouleRang = idx + 1;
            kop.koppel.spelers.forEach(spl => {
                const pouleSpl = kpl.spelers.find(sp => sp.speler.splId == spl.splId);
                if (pouleSpl) {
                    spl.splMoy = pouleSpl.uitslag.moy;
                }
            });
            kop.koppel.spelers.sort(this.compareKoppelSpelers);
            result.push(kop);
        });
        return result;
    }

    private comparePouleKoppels(a: RondeKoppel, b: RondeKoppel): number {
        if (a.uitslag.pnt == b.uitslag.pnt) {
            if ((b.uitslag.moy / b.koppel.kopMoyenne) == (a.uitslag.moy / a.koppel.kopMoyenne)) {
                return b.koppel.kopMoyenne - a.koppel.kopMoyenne;
            }
            else {
                return (b.uitslag.moy / b.koppel.kopMoyenne) - (a.uitslag.moy / a.koppel.kopMoyenne);
            }
        }
        else {
            return b.uitslag.pnt - a.uitslag.pnt;
        }
    }

    private compareKoppelSpelers(a: KoppelSpeler, b: KoppelSpeler): number {
        return a.splMoy - b.splMoy;
    }

}
