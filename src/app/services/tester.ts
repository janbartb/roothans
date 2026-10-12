import { Injectable } from '@angular/core';
import { Poule, RondeSpeelDag, SpeelRonde } from '../model/ronde';
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
    private speelDag: RondeSpeelDag = new RondeSpeelDag(0);
    private koppels: RondeKoppel[] = [new RondeKoppel(), new RondeKoppel()];
    private splSpl: KoppelSpeler = new KoppelSpeler();
    private tegSpl: KoppelSpeler = new KoppelSpeler();
    private splMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    private tegMatch: KoppelMatch = new KoppelMatch(new RondeKoppel(), new RondeKoppel());
    private splWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 0);
    private tegWed: KoppelWedstrijd = new KoppelWedstrijd(new RondeKoppel(), new RondeKoppel(), 1);
    private today: string = '';
    private aantalGevuld: number = 0;

    vulAllePouleRondeWedstrijden(rnd: SpeelRonde, conf: Seizoen) {
        this.config = conf;
        this.today = new Date().toISOString().substring(0, 10);
        this.ronde = rnd;
        this.ronde.poules.forEach(pl => {
            this.poule = pl;
            this.vulAllePouleWedstrijden(this.ronde.rndBeurten);
            this.poule.status.gestart = true;
            this.poule.status.gereed = true;
        });
        this.ronde.status.gestart = true;
        this.ronde.status.gereed = true;
    }

    vulAlleAfvalRondeWedstrijden(rnd: SpeelRonde, conf: Seizoen) {
        this.config = conf;
        this.today = new Date().toISOString().substring(0, 10);
        this.ronde = rnd;
        this.ronde.speelDagen.forEach(sdag => {
            this.speelDag = sdag;
            this.vulAlleSpeelDagWedstrijden(this.ronde.rndBeurten);
            this.speelDag.status.gestart = true;
            this.speelDag.status.gereed = true;
        });
        this.ronde.status.gestart = true;
        this.ronde.status.gereed = true;

    }

    private vulAllePouleWedstrijden(brt: number) {
        this.aantalGevuld = 0;
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
                            this.vulPouleMatchWedstrijden(idxS, idxT, brt);
                        }
                    }
                }
            });
        });
        const id = this.poule.id;
        const aant = this.aantalGevuld;
        console.log('Poule ' + id + ' : aantal ' + aant);
    }

    private vulAlleSpeelDagWedstrijden(brt: number) {
        this.aantalGevuld = 0;
        this.speelDag.matches.forEach(match => {
            match.datum = this.speelDag.datum;
            this.koppels = match.koppels;
            if (this.koppels[0].uitslag.brt == 0) {
                this.vulAfvalMatchWedstrijden(brt);
            }
        });
    }

    private vulPouleMatchWedstrijden(idxS: number, idxT: number, brt: number) {
        [0, 1].forEach(idxWed => {
            this.splSpl = this.koppels[0].spelers[idxWed];
            this.tegSpl = this.koppels[1].spelers[idxWed];
            this.splWed = this.splMatch.wedstrijden[idxWed];
            this.tegWed = this.tegMatch.wedstrijden[idxWed];
            this.pouleUitslagToevoegen(idxWed, idxS, idxT, brt);
            this.aantalGevuld++;
        });
    }

    private vulAfvalMatchWedstrijden(brt: number) {
        [0, 1].forEach(idxWed => {
            this.splSpl = this.koppels[0].spelers[idxWed];
            this.tegSpl = this.koppels[1].spelers[idxWed];
            this.afvalUitslagToevoegen(idxWed, brt);
            this.aantalGevuld++;
        });
        const splKopCars = this.koppels[0].uitslag.car + this.koppels[0].uitslag.handicap;
        const tegKopCars = this.koppels[1].uitslag.car + this.koppels[1].uitslag.handicap;
        if (splKopCars == tegKopCars) {
            const idx = Math.floor(Math.random() * 2);
            this.koppels[idx].uitslag.barrage = 1;
            this.koppels[Math.abs(idx - 1)].afgevallen = true;
        }
        else if (splKopCars > tegKopCars) {
            this.koppels[1].afgevallen = true;
        }
        else {
            this.koppels[0].afgevallen = true;
        }
    }

    private afvalUitslagToevoegen(idxWed: number, brt: number) {
        const splKoppel = this.koppels[0];
        const tegKoppel = this.koppels[1];
        const splCar = this.getAantalCaramboles(this.splSpl.splMoy, brt);
        const splSer = this.getSerie(splCar);
        let splHcap = 0;
        if (this.tegSpl.splHand < this.splSpl.splHand) {
            splHcap = this.splSpl.splHand - this.tegSpl.splHand;
        }
        const tegCar = this.getAantalCaramboles(this.tegSpl.splMoy, brt);
        const tegSer = this.getSerie(tegCar);
        let tegHcap = 0;
        if (this.splSpl.splHand < this.tegSpl.splHand) {
            tegHcap = this.tegSpl.splHand - this.splSpl.splHand;
        }
        // speler wedstrijd uitslag
        splKoppel.splUitslagen[idxWed].uitslag = new Uitslag();
        let splUit = splKoppel.splUitslagen[idxWed].uitslag;
        splUit.metWit = true;
        splUit.sco = [];
        splUit.brt = this.ronde.rndBeurten;
        splUit.car = splCar;
        splUit.handicap = splHcap;
        splUit.moy = (splUit.brt == 0) ? 0 : splUit.car / splUit.brt;
        this.setSpelerPunten(splUit, splCar + splHcap, tegCar + tegHcap, splUit.moy, this.splSpl.splMoy);
        splUit.ser = splSer;
        // speler koppel uitslag
        splKoppel.uitslag = new Uitslag();
        splKoppel.splUitslagen.forEach(splU => {
            this.addUitslagToOtherUitslag(splU.uitslag, splKoppel.uitslag);
        });
        // tegenstander wedstrijd uitslag
        tegKoppel.splUitslagen[idxWed].uitslag = new Uitslag();
        let tegUit = tegKoppel.splUitslagen[idxWed].uitslag;
        tegUit.metWit = false;
        tegUit.sco = [];
        tegUit.brt = this.ronde.rndBeurten;
        tegUit.car = tegCar;
        tegUit.handicap = tegHcap;
        tegUit.moy = (tegUit.brt == 0) ? 0 : tegUit.car / tegUit.brt;
        this.setSpelerPunten(tegUit, tegCar + tegHcap, splCar + splHcap, tegUit.moy, this.tegSpl.splMoy);
        tegUit.ser = tegSer;
        // tegenstander koppel uitslag
        tegKoppel.uitslag = new Uitslag();
        tegKoppel.splUitslagen.forEach(splU => {
            this.addUitslagToOtherUitslag(splU.uitslag, tegKoppel.uitslag);
        });
    }

    private pouleUitslagToevoegen(idxWed: number, idxS: number, idxT: number, brt:number) {
        const splKoppel = this.koppels[0];
        const tegKoppel = this.koppels[1];
        const splCar = this.getAantalCaramboles(this.splSpl.splMoy, brt);
        const splSer = this.getSerie(splCar);
        let splHcap = 0;
        if (this.tegSpl.splHand < this.splSpl.splHand) {
            splHcap = this.splSpl.splHand - this.tegSpl.splHand;
        }
        const tegCar = this.getAantalCaramboles(this.tegSpl.splMoy, brt);
        const tegSer = this.getSerie(tegCar);
        let tegHcap = 0;
        if (this.splSpl.splHand < this.tegSpl.splHand) {
            tegHcap = this.tegSpl.splHand - this.splSpl.splHand;
        }
        // speler wedstrijd uitslag
        this.splWed.uitslag = new Uitslag();
        this.splWed.metWit = true;
        this.splWed.uitslag.sco = [];
        this.splWed.uitslag.brt = this.ronde.rndBeurten;
        this.splWed.uitslag.car = splCar;
        this.splWed.uitslag.handicap = splHcap;
        this.splWed.uitslag.moy = (this.splWed.uitslag.brt == 0) ? 0 : this.splWed.uitslag.car / this.splWed.uitslag.brt;
        this.setSpelerPunten(this.splWed.uitslag, splCar + splHcap, tegCar + tegHcap, this.splWed.uitslag.moy, this.splSpl.splMoy);
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
        this.tegWed.uitslag.handicap = tegHcap;
        this.tegWed.uitslag.moy = (this.tegWed.uitslag.brt == 0) ? 0 : this.tegWed.uitslag.car / this.tegWed.uitslag.brt;
        this.setSpelerPunten(this.tegWed.uitslag, tegCar + tegHcap, splCar + splHcap, this.tegWed.uitslag.moy, this.tegSpl.splMoy);
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
        target.handicap += source.handicap;
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

    getAantalCaramboles(moy: number, brt: number): number {
        const car = Math.round((brt * moy) + (Math.random() * 8)) - 4;
        return (car < 3) ? 3 : car;
    }

    private getSerie(car: number): number {
        if (car < 6) {
            return 1;
        }
        if (car < 9) {
            return 2;
        }
        if (car < 12) {
            return 3;
        }
        return 4;
    }

}
