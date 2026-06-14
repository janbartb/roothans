import { Injectable } from '@angular/core';
import { Poule, SpeelRonde } from '../model/ronde';
import { KoppelMatch, KoppelWedstrijd, RondeKoppel } from '../model/koppel';
import { KoppelSpeler } from '../model/speler';
import { Uitslag } from '../model/misc';
import { Seizoen } from '../model/seizoen';

@Injectable({
    providedIn: 'root',
})
export class Tester {
    private config: Seizoen = new Seizoen();
    private ronde: SpeelRonde = new SpeelRonde(0, '', '', 0, '');
    private poule: Poule = new Poule(0);
    private koppels: RondeKoppel[] = [new RondeKoppel(), new RondeKoppel()];
    private splSpl: KoppelSpeler = new KoppelSpeler();
    private tegSpl: KoppelSpeler = new KoppelSpeler();
    private splMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    private tegMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    private splWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 0);
    private tegWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 1);
    private uitslagen: number[][] = [];
    private today: string = '';
    private aantalGevuld: number = 0;

    vulAllePouleRondeWedstrijden(rnd: SpeelRonde, conf: Seizoen) {
        this.config = conf;
        this.today = new Date().toISOString().substring(0, 10);
        if (rnd.rndType != 'poule' || !rnd.poules.length) {
            return;
        }
        this.ronde = rnd;
        this.ronde.poules.forEach(pl => {
            this.poule = pl;
            this.vulAllePouleWedstrijden();
            this.poule.status.gestart = true;
            this.poule.status.gereed = true;
        });
        this.ronde.status.gestart = true;
        this.ronde.status.gereed = true;
    }

    private vulAllePouleWedstrijden() {
        this.aantalGevuld = 0;
        this.uitslagen = this.getPouleUitslagen();
        this.poule.koppels.forEach((kplS, idxS) => {
            this.poule.koppels.forEach((kplT, idxT) => {
                if (idxS != idxT) {
                    this.koppels[0] = kplS;
                    this.koppels[1] = kplT;
                    let match = this.koppels[0].matches.find(m => m.tegKoppelId == this.koppels[1].kopId);
                    if (match && match.uitslag.brt == 0) {
                        this.splMatch = match;
                        match = this.koppels[1].matches.find(m => m.tegKoppelId == this.koppels[0].kopId);
                        if (match) {
                            this.tegMatch = match;
                            this.vulMatchWedstrijden();
                        }
                    }
                }
            });
        });
        const id = this.poule.id;
        const aant = this.aantalGevuld;
        console.log('Poule ' + id + ' : aantal ' + aant);
    }

    private vulMatchWedstrijden() {
        [0, 1].forEach(idxWed => {
            this.splSpl = this.koppels[0].spelers[idxWed];
            this.tegSpl = this.koppels[1].spelers[idxWed];
            this.splWed = this.splMatch.wedstrijden[idxWed];
            this.tegWed = this.tegMatch.wedstrijden[idxWed];
            this.uitslagToevoegen(idxWed);
            this.aantalGevuld++;
        });
    }

    private uitslagToevoegen(idxWed: number) {
        const splKoppel = this.koppels[0];
        const tegKoppel = this.koppels[1];
        const invoer = this.uitslagen.shift() || [0, 0, 0, 0];
        const splCar = invoer[0];
        const splSer = invoer[1];
        const tegCar = invoer[2];
        const tegSer = invoer[3];
        // speler wedstrijd uitslag
        this.splWed.uitslag = new Uitslag();
        this.splWed.metWit = true;
        this.splWed.uitslag.sco = [];
        this.splWed.uitslag.brt = this.ronde.rndBeurten;
        this.splWed.uitslag.car = splCar;
        this.splWed.uitslag.moy = (this.splWed.uitslag.brt == 0) ? 0 : this.splWed.uitslag.car / this.splWed.uitslag.brt;
        this.setSpelerPunten(this.splWed.uitslag, splCar, tegCar, this.splWed.uitslag.moy, this.splSpl.splMoy);
        this.splWed.uitslag.ser = splSer;
        // speler uitslagen
        splKoppel.splUitslagen[idxWed].uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, splKoppel.splUitslagen[idxWed].uitslag);
        });
        // speler match uitslag
        this.splMatch.datum = this.today;
        this.splMatch.uitslag = new Uitslag();
        this.splMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.splMatch.uitslag);
        });
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, splKoppel.uitslag);
        });
        // tegenstander wedstrijd uitslag
        this.tegWed.uitslag = new Uitslag();
        this.tegWed.metWit = false;
        this.tegWed.uitslag.sco = [];
        this.tegWed.uitslag.brt = this.ronde.rndBeurten;
        this.tegWed.uitslag.car = tegCar;
        this.tegWed.uitslag.moy = (this.tegWed.uitslag.brt == 0) ? 0 : this.tegWed.uitslag.car / this.tegWed.uitslag.brt;
        this.setSpelerPunten(this.tegWed.uitslag, tegCar, splCar, this.tegWed.uitslag.moy, this.tegSpl.splMoy);
        this.tegWed.uitslag.ser = tegSer;
        // tegenstander uitslagen
        tegKoppel.splUitslagen[idxWed].uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            const wed = match.wedstrijden[idxWed];
            this.addUitslagToOtherUitslag(wed.uitslag, tegKoppel.splUitslagen[idxWed].uitslag);
        });
        // tegenstander match uitslag
        this.tegMatch.datum = this.today;
        this.tegMatch.uitslag = new Uitslag();
        this.tegMatch.wedstrijden.forEach(wed => {
            this.addUitslagToOtherUitslag(wed.uitslag, this.tegMatch.uitslag);
        });
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.matches.forEach(match => {
            this.addUitslagToOtherUitslag(match.uitslag, tegKoppel.uitslag);
        });

    }

    private addUitslagToOtherUitslag(source: Uitslag, target: Uitslag) {
        target.car += source.car;
        target.brt += source.brt;
        target.moy = (target.brt == 0) ? 0 : target.car / target.brt;
        if (source.ser > target.ser) {
            target.ser = source.ser;
        }
        target.pnt += source.pnt;
        target.weds += source.weds;
        target.winst += source.winst;
        target.gelijk += source.gelijk;
        target.verlies += source.verlies;
    }

    private setSpelerPunten(uitslag: Uitslag, carSpl: number, carTeg: number, gsMoy: number, tsMoy: number) {
        let punten = 0;
        uitslag.weds = 1;
        if (carSpl > carTeg) {
            punten = this.config.pntWinst;
            uitslag.winst = 1;
        }
        else if (carSpl == carTeg) {
            punten = this.config.pntGelijk;
            uitslag.gelijk = 1;
        }
        else {
            uitslag.verlies = 1;
        }
        if (gsMoy > tsMoy) {
            punten += this.config.pntMoyenne;
        }
        uitslag.pnt = punten;
    }

    private getPouleUitslagen() {
        return [
            [12, 4, 10, 3],
            [8, 3, 7, 2],
            [10, 3, 8, 2],
            [7, 2, 6, 2],
            [8, 3, 5, 1],
            [6, 2, 4, 1],
            [12, 4, 10, 3],
            [8, 3, 7, 2],
            [10, 3, 8, 2],
            [7, 2, 6, 2],
            [8, 3, 5, 1],
            [6, 2, 4, 1]
        ];
    }
}
