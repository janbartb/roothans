import { Component, HostListener, OnInit } from '@angular/core';
import { Base } from '../../base/base';
import { Koppel } from '../../model/koppel';
import { Button } from '../../shared/button/button';
import { Btn } from '../../model/misc';
import { KoppelRow } from "./koppel-row/koppel-row";
import { NgClass } from '@angular/common';
import { Seizoen } from '../../model/seizoen';
import { Speler } from '../../model/speler';

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
    seizoenen: string[] = [];
    koppels: Koppel[] = [];
    markedForDelete: number[] = [];
    config: Seizoen = new Seizoen();
    prevSeizoen: Seizoen = new Seizoen();
    sortCol: string = 'moy';
    sortDir: number = -1;

    btnAdd: Btn = new Btn('add', 'Koppels toevoegen', 'enter');
    btnDel: Btn = new Btn('del', 'Verwijder gemarkeerde koppels', 'V', 1);
    btnCopy: Btn = new Btn('copy', '', 'H', 1);
    btnDays: Btn = new Btn('days', 'Willekeurige voorkeurdagen');

    markForDeleteClicked(event: MouseEvent, idx: number) {
        event.stopPropagation();
        if (this.header.afgesloten) {
            return;
        }
        if (this.markedForDelete.includes(idx)) {
            this.markedForDelete = this.markedForDelete.filter(x => x != idx);
        }
        else {
            this.markedForDelete.push(idx);
        }
    }

    randomVoorkeurdagenClicked() {
        const aantVoorkeurdagen = 2;
        const dagen = this.config.speelDagen.map(sd => sd.dagNr);
        const aantDagen = dagen.length;
        if (aantDagen < 2) {
            this.alert.showWarning('Kan voorkeurdagen niet vullen. Aantal speeldagen in config < 2', 6);
            return;
        }
        this.koppels.forEach(kpl => {
            const dag1 = dagen[Math.floor(Math.random() * aantDagen)];
            let restDagen = dagen.filter(d => d != dag1);
            const dag2 = restDagen[Math.floor(Math.random() * (aantDagen - 1))];
            restDagen = restDagen.filter(d => d != dag2);
            const dag3 = restDagen[Math.floor(Math.random() * (aantDagen - 2))];
            for (let i = 0; i < aantDagen; i++) {
                if (i > (aantVoorkeurdagen - 1)) {
                    kpl.voorkeurDagen[i] = -1;
                }
                else if (i == 0) {
                    kpl.voorkeurDagen[0] = dag1;
                }
                else if (i == 1) {
                    kpl.voorkeurDagen[1] = dag2;
                }
                else {
                    kpl.voorkeurDagen[2] = dag3;
                }
            }
        });
        this.dao.saveKoppels(this.header.seizoen, this.koppels)
        .then(resp => {
            this.alert.showSuccess('Koppels succesvol opgeslagen.');
        })
        .catch(err => {
            this.alert.showError(err)
        });
    }

    koppelClicked(idx: number) {
        if (this.header.afgesloten) {
            return;
        }
        this.gotoPage(`koppels/${this.koppels[idx].kopId}`, 'koppels');
    }

    toevoegenClicked() {
        if (this.header.afgesloten) {
            return;
        }
        this.gotoPage('koppels/toevoegen', 'koppels');
    }

    trashClicked() {
        if (this.header.afgesloten) {
            return;
        }
        if (this.markedForDelete.length) {
            this.markedForDelete = [];
        }
        else {
            this.koppels.forEach((kpl, idx) => this.markedForDelete.push(idx));
        }
    }

    ophalenClicked() {
        this.koppelsOphalenVanSeizoen('' + this.prevSeizoen.id);
    }

    deleteClicked() {
        if (this.header.afgesloten) {
            return;
        }
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

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.koppels.length < this.config.maxKoppels) {
                this.buttonPressed(this.btnAdd);
                return false;
            }
            return true;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyH') {
            if (this.prevSeizoen.id > 0 && this.koppels.length == 0) {
                this.buttonPressed(this.btnCopy);
                return false;
            }
            return true;
        }
        if (event.code === 'KeyV') {
            if (this.markedForDelete.length) {
                this.buttonPressed(this.btnDel);
                return false;
            }
            return true;
        }
        if (event.key === 'Home') {
            this.gotoHome();
            return false;
        }
        return true;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Koppels';

        Promise.all([
            this.dao.getSeizoenen(),
            this.dao.getKoppels(this.header.seizoen),
            this.dao.getSeizoenFile(this.header.seizoen)
        ])
        .then(results => {
            this.seizoenen = results[0];
            this.koppels = results[1];
            this.config = results[2];
            this.seizoenen.sort(this.compareSeizoenen);
            const idx = this.seizoenen.findIndex(sz => sz == this.header.seizoen);
            if (idx > 0) {
                 const prevSeiz = this.seizoenen[idx - 1];
                this.dao.getSeizoenFile(prevSeiz)
                .then(seiz => {
                    this.prevSeizoen = seiz;
                    if (this.prevSeizoen.afgesloten) {
                        this.btnCopy.text = `Haal koppels op uit seizoen ${this.prevSeizoen.id}`;
                    }
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            this.header.subtitle = 'Seizoen ' + this.header.seizoen + ` - Koppels (${this.koppels.length})`;
            this.sortKoppels('moy');
            console.log(this.koppels);
            console.log(this.config);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private buttonPressed(btn: Btn) {
        if (this.header.afgesloten) {
            return;
        }
        btn.clicked = true;
        setTimeout(() => {
            btn.clicked = false;
            setTimeout(() => {
                if (btn.id == 'add') {
                    this.toevoegenClicked();
                }
                else if (btn.id == 'del') {
                    this.deleteClicked();
                }
                else if (btn.id == 'copy') {
                    this.ophalenClicked();
                }
            }, 250);
        }, 250);
    }

    private koppelsOphalenVanSeizoen(seiz: string) {
        Promise.all([
            this.dao.getKoppels(seiz),
            this.dao.getSpelers()
        ])
        .then(results => {
            const idsNotFound: string[] = [];
            const koppels: Koppel[] = results[0];
            const spelers: Speler[] = results[1];
            koppels.forEach(kpl => {
                kpl.spelers.forEach(kopSpl => {
                    const idx = spelers.findIndex(spl => spl.id == kopSpl.splId);
                    if (idx < 0) {
                        idsNotFound.push(kpl.kopId + '-' + kopSpl.splId);
                    }
                    else {
                        kopSpl.splMoy = spelers[idx].moyenne;
                    }
                });
                kpl.kopMoyenne = (kpl.spelers[0].splMoy + kpl.spelers[1].splMoy) / 2;
            });
            this.dao.saveKoppels(this.header.seizoen, koppels)
            .then(resp => {
                if (idsNotFound.length) {
                    this.alert.showWarning('Niet alle koppel-speler gemiddeldes zijn aangepast. (zie console)', 6);
                    console.error(idsNotFound);
                }
                else {
                    this.alert.showSuccess(`Koppels van seizoen ${seiz} succesvol gekopieerd en opgeslagen.`);
                }
                this.koppels = koppels;
                this.sortDir = -1;
                this.sortKoppels('moy');
                this.header.subtitle = 'Seizoen ' + this.header.seizoen + ` - Koppels (${this.koppels.length})`;
            })
            .catch(err => {
                this.alert.showError(err);
            });
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

    private compareKopIds = (a: Koppel, b: Koppel): number => {
        return a.kopId < b.kopId ? -1 : 1;
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
    
    private compareSeizoenen = (a: string, b: string): number => {
        return a > b ? 1 : -1;
    }
    
}
