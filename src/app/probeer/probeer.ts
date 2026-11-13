import { Component, OnInit, inject } from '@angular/core';
import { Base } from '../base/base';
import { DateHelper } from '../services/date-helper';
import { Koppel } from '../model/koppel';
import { Poule } from '../model/ronde';
import { Btn } from '../model/misc';
import { Button } from '../shared/button/button';

@Component({
    selector: 'app-probeer',
    templateUrl: './probeer.html',
    imports: [
        Button
    ],
    styleUrl: './probeer.css'
})
export class Probeer extends Base implements OnInit {
    dater = inject(DateHelper);
    koppels: Koppel[] = [];
    poules: Poule[] = [];
    message: string = '';
    loopCnt: number = 0;

    btnPlan: Btn = new Btn('plan', 'Poules aanmaken');

    poulesAanmakenClicked() {
        this.poules = [];
        let idxStart = -1;
        let done = false;
        while(!done) {
            const createdPoules = this.poulesAanmaken(8, idxStart, this.koppels);
            if (this.message != '') {
                done = true;
            }
            else {
                if (createdPoules.length < 8) {
                    idxStart++;
                    if (idxStart >= (this.koppels.length - 4)) {
                        done = true;
                        this.message = 'Helaas !!!'
                    }
                }
                else {
                    this.message = 'Klaar !!!';
                    this.poules = createdPoules;
                    done = true;
                }
            }
        }
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'Probeer scherm';
        this.dao.getKoppels('2027')
        .then(data => {
            this.koppels = data;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private poulesAanmaken(aantal: number, idxStartKoppel: number, metKoppels: Koppel[]): Poule[] {
        const result: Poule[] = [];
        this.loopCnt++;
        if (this.loopCnt > 1000) {
            this.message = 'loop count limit reached';
            return result;
        }
        if (aantal == 0) {
            return result; // done
        }
        idxStartKoppel++;
        const startKoppel = metKoppels[idxStartKoppel];
        const dagNr = startKoppel.voorkeurDagen[0];
        const metDagKoppels = metKoppels.filter(kpl => kpl.voorkeurDagen.includes(dagNr));
        if (metDagKoppels.length < 4) {
            return result;
        }
        const poule = new Poule(0);
        poule.dagNr = dagNr;
        poule.dagNaam = this.dater.getDagNaam(dagNr);
        poule.koppelIds.push(metDagKoppels[0].kopId);
        poule.koppelIds.push(metDagKoppels[1].kopId);
        poule.koppelIds.push(metDagKoppels[2].kopId);
        poule.koppelIds.push(metDagKoppels[3].kopId);
        result.push(poule);
        const remainingKoppels = metKoppels.filter(kpl => !poule.koppelIds.includes(kpl.kopId));
        let idxStart = -1;
        let done = false;
        const aant = aantal - 1;
        while(!done) {
            const createdPoules = this.poulesAanmaken(aant, idxStart, remainingKoppels);
            if (this.message != '') {
                done = true;
            }
            else {
                if (createdPoules.length < aant) {
                    idxStart++;
                    if (idxStart >= (remainingKoppels.length - 4)) {
                        done = true;
                    }
                }
                else {
                    result.push(...createdPoules);
                    done = true;
                }
            }
        }
        return result;
    }

}
