import { Component, HostListener, OnInit } from '@angular/core';
import { KoppelResultaat, KoppelResultaatSpeler, SpelerResultaat } from '../../model/speler';
import { Base } from '../../base/base';
import { Ronde, SpeelRonde } from '../../model/ronde';
import { RondeKoppel } from '../../model/koppel';
import { DecimalPipe, NgClass } from '@angular/common';
import { Seizoen } from '../../model/seizoen';
import { Button } from '../../shared/button/button';
import { Btn } from '../../model/misc';

class Moyenne {
    id: string = '';
    moy: number = 0;

    constructor(i: string, m: number) {
        this.id = i;
        this.moy = m;
    }
}

@Component({
    selector: 'app-eind-resultaat',
    imports: [
        Button,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './eind-resultaat.html',
    styleUrl: './eind-resultaat.css',
})
export class EindResultaat extends Base implements OnInit {
    seizoen: Seizoen = new Seizoen();
    spelers: SpelerResultaat[] = [];
    koppels: KoppelResultaat[] = [];
    origKopMoys: Moyenne[] = [];
    origSplMoys: Moyenne[] = [];
    keuze: number = 0; // 0 = koppel overzicht, 1 = speler overzicht
    kopSortDir: number = 1;
    kopSortCol: string = 'rang';
    splSortDir: number = 1;
    splSortCol: string = 'rang';

    btnSluit: Btn = new Btn('sluit', 'afsluiten', 'enter');

    kopSortClicked(colNaam: string) {
        if (colNaam == this.kopSortCol) {
            this.kopSortDir = -1 * this.kopSortDir;
        }
        else {
            this.kopSortCol = colNaam;
            this.kopSortDir = 1;
            if (colNaam == 'kopmoy' || colNaam == 'totmoy' || colNaam == 'rend') {
                this.kopSortDir = -1
            }
        }
        this.sortKoppels(colNaam);
    }

    splSortClicked(colNaam: string) {
        if (colNaam == this.splSortCol) {
            this.splSortDir = -1 * this.splSortDir;
        }
        else {
            this.splSortCol = colNaam;
            this.splSortDir = 1;
            if (colNaam == 'splmoy' || colNaam == 'totmoy' || colNaam == 'rend') {
                this.splSortDir = -1
            }
        }
        this.sortSpelers(colNaam);
    }

    keuzeClicked(kz: number) {
        this.keuze = kz;
    }

    afsluitenClicked() {
        this.gotoPage('afsluiten', this.router.url);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (!this.seizoen.afgesloten) {
                this.buttonPressed(this.btnSluit);
                return false;    
            }
            return true;
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
        this.header.subtitle = `Seizoen ${this.header.seizoen} - Eindresultaat`;
        this.btnSluit.text = this.header.seizoen + ' afsluiten';

        let rondes: Ronde[] = [];
        Promise.all([
            this.dao.getSeizoenFile(this.header.seizoen),
            this.dao.getRondes(this.header.seizoen)
        ])
        .then(data => {
            this.seizoen = data[0];
            rondes = data[1];
            if (!rondes[rondes.length - 1].status.gereed) {
                this.alert.showWarning('Eindresultaat nog niet beschikbaar. Tournooi niet afgewerkt.');
                return;
            }
            let promises: Promise<SpeelRonde>[] = [];
            rondes.forEach((rnd) => {
                    promises.push(this.dao.getSpeelRondeFile(this.header.seizoen, rnd.fileNaam));
            });
            Promise.all(promises)
            .then(results => {
                results[0].koppels.forEach(kpl => {
                    this.origKopMoys.push(new Moyenne(kpl.kopId, kpl.kopMoyenne));
                    kpl.spelers.forEach(spl => {
                        this.origSplMoys.push(new Moyenne(spl.splId, spl.splMoy));
                    });
                });
                results.forEach((speelRnd, idx) => {
                    if (idx > 0) {
                        this.fillRondeResultaten(speelRnd, rondes.length);
                    }
                });
                this.sortKoppels(this.kopSortCol);
                this.sortSpelers(this.splSortCol);
                console.log(this.koppels);
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
                if (btn.id == 'sluit') {
                    this.afsluitenClicked();
                }
            }, 250);
        }, 250);
    }

    private fillRondeResultaten(rnd: SpeelRonde, aantRnds: number) {
        let afvOms = 'Runner up';
        if (rnd.rndNaam.includes('finales')) {
            afvOms = rnd.rndNaam.replace('finales', 'finalist');
        }
        let afvNr = aantRnds + 1 - Number(rnd.rndId);
        let kops: RondeKoppel[] = rnd.koppels.filter(kpl => kpl.afgevallen);
        kops.forEach(kpl => {
            // resultaten koppel
            this.koppels.push(this.createKoppelEntry(kpl, afvNr, afvOms));
            // resultaten koppel-spelers
            kpl.spelers.forEach((spl, idx) => {
                this.spelers.push(this.createSpelerEntry(kpl, idx, afvNr, afvOms));
            });
        });
        if (rnd.rndNaam == 'Finale') {
            console.log(rnd);
            afvOms = 'Kampioen';
            afvNr = 0;
            kops = rnd.koppels.filter(kpl => !kpl.afgevallen);
            kops.forEach(kpl => {
                // winnaar koppel
                this.koppels.push(this.createKoppelEntry(kpl, afvNr, afvOms));
                // winnaars koppel-spelers
                kpl.spelers.forEach((spl, idx) => {
                    this.spelers.push(this.createSpelerEntry(kpl, idx, afvNr, afvOms));
                });
            });
        }
    }

    private createKoppelEntry(kpl: RondeKoppel, afvNr: number, afvOms: string): KoppelResultaat {
        this.addUitslagToOtherUitslag(kpl.uitslag, kpl.totNuToe);
        let kopRes = new KoppelResultaat();
        kopRes.id = kpl.kopId;
        kpl.spelers.forEach(sp => {
            kopRes.spelers.push(new KoppelResultaatSpeler(sp));
        });
        const foundMoy = this.origKopMoys.find(km => km.id == kpl.kopId);
        kopRes.afvalNr = afvNr;
        kopRes.afvalOms = afvOms;
        kopRes.kopMoy = foundMoy ? foundMoy.moy : 0;
        kopRes.aantMat = kpl.totNuToe.weds / 2;
        kopRes.aantCar = kpl.totNuToe.car;
        kopRes.aantBrt = kpl.totNuToe.brt;
        kopRes.serie = kpl.totNuToe.ser;
        kopRes.totMoy = kpl.totNuToe.moy;
        kopRes.totPerc = (kopRes.kopMoy == 0) ? 0 : 100 * kopRes.totMoy / kopRes.kopMoy;
        return kopRes;
    }
    
    private createSpelerEntry(kpl: RondeKoppel, idxSpl: number, afvNr: number, afvOms: string): SpelerResultaat {
        const splUit = kpl.splUitslagen[idxSpl];
        this.addUitslagToOtherUitslag(splUit.uitslag, splUit.totNuToe);
        const spl = kpl.spelers[idxSpl];
        const tnt = splUit.totNuToe;
        const foundMoy = this.origSplMoys.find(sm => sm.id == spl.splId);
        let splRes = new SpelerResultaat();
        splRes.id = spl.splId;
        splRes.kopId = kpl.kopId;
        splRes.naam = spl.splNaam;
        splRes.splMoy = foundMoy ? foundMoy.moy : 0;
        splRes.afvalNr = afvNr;
        splRes.afvalOms = afvOms;
        splRes.pouleId = kpl.pouleId;
        splRes.aantWed = tnt.weds;
        splRes.aantW = tnt.winst;
        splRes.aantG = tnt.gelijk;
        splRes.aantV = tnt.verlies;
        splRes.aantCar = tnt.car;
        splRes.aantBrt = tnt.brt;
        splRes.serie = tnt.ser;
        splRes.totMoy = tnt.moy;
        splRes.totPerc = (splRes.splMoy == 0) ? 0 : 100 * splRes.totMoy / splRes.splMoy;
        return splRes;
    }
    
    private sortKoppels(colNaam: string) {
        if (colNaam == 'rang') {
            this.koppels.sort(this.compareKopRang);
        }
        else if (colNaam == 'spl1') {
            this.koppels.sort(this.compareKopNames1);
        }
        else if (colNaam == 'spl2') {
            this.koppels.sort(this.compareKopNames2);
        }
        else if (colNaam == 'kopmoy') {
            this.koppels.sort(this.compareKopKopmoy);
        }
        else if (colNaam == 'totmoy') {
            this.koppels.sort(this.compareKopTotmoy);
        }
        else if (colNaam == 'rend') {
            this.koppels.sort(this.compareKopRend);
        }
    }

    private sortSpelers(colNaam: string) {
        if (colNaam == 'rang') {
            this.spelers.sort(this.compareSplRang);
        }
        else if (colNaam == 'naam') {
            this.spelers.sort(this.compareSplNaam);
        }
        else if (colNaam == 'splmoy') {
            this.spelers.sort(this.compareSplSplmoy);
        }
        else if (colNaam == 'totmoy') {
            this.spelers.sort(this.compareSplTotmoy);
        }
        else if (colNaam == 'rend') {
            this.spelers.sort(this.compareSplRend);
        }
    }

    private compareKopRang = (a: KoppelResultaat, b: KoppelResultaat): number => {
        if (a.afvalNr == b.afvalNr) {
            return this.kopSortDir * -1 * (a.totPerc - b.totPerc);
        }
        else {
            return this.kopSortDir * (a.afvalNr - b.afvalNr);
        }
    }
    
    private compareKopNames1 = (a: KoppelResultaat, b: KoppelResultaat): number => {
        return this.kopSortDir * (a.spelers[0].naam < b.spelers[0].naam ? -1 : 1);
    }
    
    private compareKopNames2 = (a: KoppelResultaat, b: KoppelResultaat): number => {
        return this.kopSortDir * (a.spelers[1].naam < b.spelers[1].naam ? -1 : 1);
    }
    
    private compareKopKopmoy = (a: KoppelResultaat, b: KoppelResultaat): number => {
        return this.kopSortDir * (a.kopMoy - b.kopMoy);
    }
    
    private compareKopTotmoy = (a: KoppelResultaat, b: KoppelResultaat): number => {
        return this.kopSortDir * (a.totMoy - b.totMoy);
    }
    
    private compareKopRend = (a: KoppelResultaat, b: KoppelResultaat): number => {
        return this.kopSortDir * (a.totPerc - b.totPerc);
    }
    
    private compareSplRang = (a: SpelerResultaat, b: SpelerResultaat): number => {
        if (a.afvalNr == b.afvalNr) {
            return this.splSortDir * -1 * (a.totPerc - b.totPerc);
        }
        else {
            return this.splSortDir * (a.afvalNr - b.afvalNr);
        }
    }
    
    private compareSplNaam = (a: SpelerResultaat, b: SpelerResultaat): number => {
        return this.splSortDir * (a.naam < b.naam ? -1 : 1);
    }
    
    private compareSplSplmoy = (a: SpelerResultaat, b: SpelerResultaat): number => {
        return this.splSortDir * (a.splMoy - b.splMoy);
    }
    
    private compareSplTotmoy = (a: SpelerResultaat, b: SpelerResultaat): number => {
        return this.splSortDir * (a.totMoy - b.totMoy);
    }
    
    private compareSplRend = (a: SpelerResultaat, b: SpelerResultaat): number => {
        return this.splSortDir * (a.totPerc - b.totPerc);
    }
    
}
