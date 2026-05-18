import { Koppel } from "./koppel";
import { Status } from "./misc";
import { KoppelSpeler } from "./speler";

export class Ronde {
    rndId: number = 0;
    rndNaam: string = '';
    rndType: string = '';
    rndBeurten: number = 0;
    fileNaam: string = '';
    status: Status = new Status();

    constructor(id: number, naam: string, type: string, brt: number, file: string) {
        this.rndId = id;
        this.rndNaam = naam;
        this.rndType = type;
        this.rndBeurten = brt;
        this.fileNaam = file;
    }
}

export class PouleRonde extends Ronde {
    koppels: PouleKoppel[] = [];
    poules: Poule[] = [];

    constructor(id: number, naam: string, brt: number, file: string) {
        super(id, naam, 'poule', brt, file);
    }
}

export class Poule {
    pouleId: string = '';
    pouleVolgNr: number = 0;
    pouleDagNr: number = -1;
    pouleDagNaam: string = '';
    pouleDatum: string = '';
    pouleKoppels: PouleKoppel[] = [];
    pouleGestart: boolean = false;
    pouleGespeeld: boolean = false;
}

export class PouleKoppel {
    id: string = '';
    koppel: Koppel = new Koppel();
    uitslag: Uitslag = new Uitslag();
    spelers: PouleKoppelSpeler[] = [];

    constructor(kpl: Koppel) {
        this.koppel = kpl;
        this.spelers.push(new PouleKoppelSpeler(kpl.spelers[0]));
        this.spelers.push(new PouleKoppelSpeler(kpl.spelers[1]));
    }
}

export class PouleKoppelSpeler {
    speler: KoppelSpeler = new KoppelSpeler();
    uitslag: Uitslag = new Uitslag();
    wedstrijden: PouleKoppelWedstrijd[] = [];

    constructor(spl: KoppelSpeler) {
        this.speler = spl;
    }
}

export class PouleKoppelWedstrijd {
    volgNr: number = 0;
    tegPouleKoppelId: string = '';
    tegenstander: KoppelSpeler = new KoppelSpeler();
    wedDatum: string = '';
    metWit: boolean = false;
    uitslag: Uitslag = new Uitslag();
    score: number[] = [];

    constructor(teg: KoppelSpeler) {
        this.tegenstander = teg;
    }
}

export class Uitslag {
    car: number = 0;
    brt: number = 0;
    ser: number = 0;
    moy: number = 0;
    pnt: number = 0;
}

export class AfvalRonde extends Ronde {
    koppels: AfvalKoppel[] = [];
    speelDagen: AfvalDag[] = [];
    maxDagen: number = 0;
    maxMatchesPerDag: number = 4;

    constructor(id: number, naam: string, brt: number, file: string) {
        super(id, naam, 'afval', brt, file);
    }
}

export class AfvalKoppel {
    id: string = '';
    koppel: Koppel = new Koppel();
    pouleId: string = '';
    pouleRang: number = 0;
    afgevallen: boolean = false;
    ingepland: boolean = false;
}

export class AfvalDag {
    dagNr: number = -1;
    dagNaam: string = '';
    dagDatum: string = '';
    dagGepland: boolean = false;
    dagGestart: boolean = false;
    dagGereed: boolean = false;
    mogelijkeData: string[] = [];
    dagMatches: AfvalMatch[] = [];

    constructor(matchesPerDag: number) {
        let count = 0;
        while (count < matchesPerDag) {
            this.dagMatches.push(new AfvalMatch());
            count++;
        }
    }
}

export class AfvalMatch {
    splKoppelId: string = '';
    tegKoppelId: string = '';
    splKoppel: AfvalKoppel = new AfvalKoppel();
    tegKoppel: AfvalKoppel = new AfvalKoppel();
    datum: string = '';
    splKopUitslag: Uitslag = new Uitslag();
    tegKopUitslag: Uitslag = new Uitslag();
    splBarrageWinst: boolean = false;
    tegBarrageWinst: boolean = false;
    wedstrijden: AfvalWedstrijd[] = [];
}

export class AfvalWedstrijd {
    splSpeler: KoppelSpeler = new KoppelSpeler();
    tegSpeler: KoppelSpeler = new KoppelSpeler();
    splUitslag: Uitslag = new Uitslag();
    tegUitslag: Uitslag = new Uitslag();
}
