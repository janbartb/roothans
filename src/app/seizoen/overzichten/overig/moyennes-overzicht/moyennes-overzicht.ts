import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Base } from '../../../../base/base';
import { Btn } from '../../../../model/misc';
import { SpeelRonde } from '../../../../model/ronde';
import { Helper } from '../../../../services/helper';
import { Button } from '../../../../shared/button/button';
import { DecimalPipe } from '@angular/common';

class SpelerMoyenne {
    naam: string = '';
    moyenne: number = 0;
    handicap: number = 0;
}

@Component({
    selector: 'app-moyennes-overzicht',
    imports: [
        Button,
        DecimalPipe
    ],
    templateUrl: './moyennes-overzicht.html',
    styleUrl: './moyennes-overzicht.css',
})
export class MoyennesOverzicht extends Base implements OnInit {
    helper = inject(Helper);
    moyennes: SpelerMoyenne[] = [];
    leftCol: SpelerMoyenne[] = [];
    rightCol: SpelerMoyenne[] = [];
    dataReady: boolean = false;
    btnPrint: Btn = new Btn('print', 'Print overzicht', 'enter');

    printOvz() {
        window.print();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.btnPrint);
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
        this.header.subtitle = 'Seizoen ' + this.header.seizoen + ' - Overzicht nieuwe moyennes ';

        this.dao.getRondes(this.header.seizoen)
        .then(rnds => {
            rnds.shift(); // remove first (voorronde)
            const promises: Promise<SpeelRonde>[] = [];
            rnds.forEach(rnd => promises.push(this.dao.getSpeelRondeFile(this.header.seizoen, rnd.fileNaam)));
            Promise.all(promises)
            .then(rondes => {
                rondes.forEach(ronde => this.processRonde(ronde));
                this.moyennes.sort(this.compareMoyennes);
                if (this.moyennes.length) {
                    if (this.moyennes.length >= 32) {
                        this.leftCol = this.moyennes.slice(0, 32);
                        if (this.moyennes.length >= 64) {
                            this.rightCol = this.moyennes.slice(32, 64);
                        }
                        else {
                            this.rightCol = this.moyennes.slice(32);
                        }
                    }
                    else {
                        this.leftCol = this.moyennes.slice(0);
                    }
                }
                this.dataReady = true;
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
                if (btn.id == 'print') {
                    this.printOvz();
                }
            }, 250);
        }, 250);
    }

    private processRonde(rnd: SpeelRonde) {
        const isFinale = rnd.rndNaam == 'Finale';
        let koppels = rnd.koppels.filter(kpl => kpl.afgevallen);
        if (isFinale) {
            koppels = rnd.koppels;
        }
        koppels.forEach(kpl => {
            kpl.spelers.forEach((spl, idx) => {
                const entry = new SpelerMoyenne();
                entry.naam = spl.splNaam;
                this.addUitslagToOtherUitslag(kpl.splUitslagen[idx].uitslag, kpl.splUitslagen[idx].totNuToe);
                entry.moyenne = kpl.splUitslagen[idx].totNuToe.moy;
                entry.handicap = this.helper.getHandicap(entry.moyenne);
                this.moyennes.push(entry);
            });
        });
    }

    compareMoyennes(a: SpelerMoyenne, b: SpelerMoyenne): number {
        return b.moyenne - a.moyenne;
    }

}
