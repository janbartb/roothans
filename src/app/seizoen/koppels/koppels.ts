import { Component, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Koppel } from '../../model/koppel';
import { Button } from '../../shared/button/button';
import { Btn } from '../../model/misc';
import { KoppelRow } from "./koppel-row/koppel-row";
import { NgClass } from '@angular/common';
import { Seizoen } from '../../model/seizoen';

@Component({
    selector: 'app-koppels',
    imports: [
        Button,
        KoppelRow,
        NgClass
    ],
    templateUrl: './koppels.html',
    styleUrl: './koppels.css',
})
export class Koppels extends Base implements OnInit {
    koppels: Koppel[] = [];
    markedForDelete: number[] = [];
    config: Seizoen = new Seizoen();
    sortCol: string = 'moy';
    sortDir: number = -1;

    btnAdd: Btn = new Btn('add', 'Koppels toevoegen');
    btnDel: Btn = new Btn('del', 'Verwijder gemarkeerde koppels');

    markForDeleteClicked(event: MouseEvent, idx: number) {
        event.stopPropagation();
        if (this.markedForDelete.includes(idx)) {
            this.markedForDelete = this.markedForDelete.filter(x => x != idx);
        }
        else {
            this.markedForDelete.push(idx);
        }
    }

    koppelClicked(idx: number) {
        this.gotoPage(`koppels/${this.koppels[idx].kopId}`, 'koppels');
    }

    toevoegenClicked() {
        this.gotoPage('koppels/toevoegen', 'koppels');
    }

    deleteClicked() {
        const remaining = this.koppels.filter((kpl, idx) => !this.markedForDelete.includes(idx));
        this.dao.saveKoppels(this.header.seizoen, remaining)
        .then(resp => {
            this.markedForDelete = [];
            this.koppels = remaining;
            this.header.subtitle = 'Seizoen ' + this.header.seizoen + ` - Koppels (${this.koppels.length})`;
            this.alert.showSuccess(resp.message);
        })
        .catch(err => {
            this.alert.showError(err)
        });
    }

    sortClicked(colNaam: string) {
        if (colNaam == this.sortCol) {
            this.sortDir = -1 * this.sortDir;
        }
        else {
            this.sortCol = colNaam;
            this.sortDir = colNaam == 'moy' ? -1 : 1;
        }
        this.sortKoppels(colNaam);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Koppels';

        Promise.all([
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getSeizoenFile(this.header.seizoen)
        ])
        .then(results => {
            this.koppels = results[0];
            this.config = results[1];
            this.header.subtitle = 'Seizoen ' + this.header.seizoen + ` - Koppels (${this.koppels.length})`;
            this.sortKoppels('moy');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private sortKoppels(colNaam: string) {
        if (colNaam == 'spl1') {
            this.koppels.sort(this.compareNames1);
        }
        else if (colNaam == 'spl2') {
            this.koppels.sort(this.compareNames2);
        }
        else {
            this.koppels.sort(this.compareMoyennes);
        }
    }

    private compareNames1 = (a: Koppel, b: Koppel): number => {
        return this.sortDir * (a.spelers[0].splNaam < b.spelers[0].splNaam ? -1 : 1);
    }
    
    private compareNames2 = (a: Koppel, b: Koppel): number => {
        return this.sortDir * (a.spelers[1].splNaam < b.spelers[1].splNaam ? -1 : 1);
    }
    
    private compareMoyennes = (a: Koppel, b: Koppel): number => {
        return this.sortDir * (a.kopMoyenne - b.kopMoyenne);
    }
    
}
