import { Component, HostListener, OnInit } from '@angular/core';
import { Ronde } from '../../model/ronde';
import { Base } from '../../base/base';
import { Koppel } from '../../model/koppel';
import { Seizoen } from '../../model/seizoen';
import { RondeView } from './ronde-view/ronde-view';

@Component({
    selector: 'app-rondes',
    imports: [
        RondeView
    ],
    templateUrl: './rondes.html',
    styleUrl: './rondes.css',
})
export class Rondes extends Base implements OnInit {
    config: Seizoen = new Seizoen();
    rondes: Ronde[] = [];
    dummy: Ronde = new Ronde(0, '', '', 0, '');
    koppels: Koppel[] = [];
    rondeButtonPressedIds: string[] = [];

    enterPressed() {
        this.rondes.some((rnd, idx) => {
            if (rnd.status.gepland) {
                return false;
            }
            else {
                this.rondeButtonPressedIds[idx] = 'plan';
                return true;
            }
        });
    }

    plannenClicked(rondeId: number) {
        const rondeType = this.rondes[rondeId - 1].rndType;
        console.log(`rondes/${rondeType}/${rondeId}/planner`)
        this.gotoPage(`rondes/${rondeType}/${rondeId}/planner`, 'rondes');
    }

    spelenClicked(rondeId: number) {
        const rondeType = this.rondes[rondeId - 1].rndType;
        this.gotoPage(`rondes/${rondeType}/${rondeId}/spel`, 'rondes');        
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Rondes';

        this.dummy.status.gepland = true;
        this.dummy.status.gestart = true;
        this.dummy.status.gereed = true;

        Promise.all([
            this.dao.getRondes(this.header.seizoen),
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getSeizoenFile(this.header.seizoen)
        ])
        .then(results => {
            this.rondes = results[0];
            this.koppels = results[1];
            this.config = results[2];
            if (!this.rondes.length) {
                const allRondes = this.createRondes();
                this.dao.createRondes(this.header.seizoen, allRondes)
                .then(resp => {
                    this.alert.showSuccess(resp.message);
                    this.rondes = allRondes;
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            let size = this.rondes.length;
            while(size--) this.rondeButtonPressedIds.push('');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private createRondes(): Ronde[] {
        let rnds: Ronde[] = [];
        let rondeId = 1;
        rnds.push(new Ronde(rondeId, 'Voorronde', 'poule', 15, 'voorronde'));
        let aantMatches = this.config.maxKoppels / 2;
        while(aantMatches > 4) {
            rondeId++;
            rnds.push(new Ronde(rondeId, `${aantMatches}e finales`, 'afval', 20, `finales-${aantMatches}`, rondeId == 2));
            aantMatches = aantMatches / 2;
        }
        rondeId++;
        rnds.push(new Ronde(rondeId, `Kwart finales`, 'afval', 20, 'kwart-finales'));
        rondeId++;
        rnds.push(new Ronde(rondeId, `Halve finales`, 'afval', 20, 'halve-finales', true));
        rondeId++;
        rnds.push(new Ronde(rondeId, `Finale`, 'afval', 20, 'finale'));
        return rnds;
    }
}
