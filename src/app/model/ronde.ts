import { KoppelPreferences } from "../seizoen/koppels/koppel-preferences/koppel-preferences";
import { Koppel } from "./koppel";
import { KoppelSpeler } from "./speler";

export class Ronde {
    rndId: number = 0;
    rndNaam: string = '';
    rndType: string = '';
    rndBeurten: number = 0;
    fileNaam: string = '';
    rndGepland: boolean = false;
    rndGespeeld: boolean = false;

    constructor(id: number, naam: string, type: string, brt: number, file: string) {
        this.rndId = id;
        this.rndNaam = naam;
        this.rndType = type;
        this.rndBeurten = brt;
        this.fileNaam = file;
    }
}

export class PouleRonde extends Ronde {
    poules: Poule[] = [];

    constructor(id: number, naam: string, brt: number, file: string) {
        super(id, naam, 'poule', brt, file);
    }
}

export class Poule {
    pouleId: string = '';
    pouleDagNr: number = -1;
    pouleDagNaam: string = '';
    pouleDatum: string = '';
    pouleKoppels: PouleKoppel[] = [];
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

export class AfvalRonde {
    id: number = 0;
    naam: string = '';    
}

export class PouleExtended {
    pouleId: string = '';
    koppels: Koppel[] = [];

    constructor(aantKoppels: number) {
        for (let i = 0; i < aantKoppels; i++) {
            this.koppels.push(new Koppel());
        }
    }
}

export class PouleSchema {
    pouleId: string = '';
    pouleDagNr: number = -1;
    pouleDagNaam: string = '';
    pouleDatum: string = '';
    pouleKoppels: PouleSchemaKoppel[] = [];

    constructor(poule: Poule) {
        this.pouleId = poule.pouleId;
        this.pouleDagNr = poule.pouleDagNr;
        this.pouleDagNaam = poule.pouleDagNaam;
        this.pouleDatum = poule.pouleDatum;
        poule.pouleKoppels.forEach(pk => {
            this.pouleKoppels.push(new PouleSchemaKoppel(pk));
        });
    }
}
export class PouleSchemaKoppel {
    id: string = '';
    koppel: Koppel = new Koppel();
    uitslag: Uitslag = new Uitslag();
    spelers: PouleSchemaSpeler[] = [];

    constructor(kpl: PouleKoppel) {
        this.id = kpl.id;
        this.koppel = kpl.koppel;
        this.uitslag = kpl.uitslag;
        kpl.spelers.forEach(spl => {
            this.spelers.push(new PouleSchemaSpeler(spl));
        });
    }
}
export class PouleSchemaSpeler {
    speler: KoppelSpeler = new KoppelSpeler();
    uitslag: Uitslag = new Uitslag();
    wedstrijden: PouleSchemaWedstrijd[] = [];

    constructor(spl: PouleKoppelSpeler) {
        this.speler = spl.speler;
        this.uitslag = spl.uitslag;
    }
}
export class PouleSchemaWedstrijd {
    volgNr: number = 0;
    tegPouleKoppelId: string = '';
    tegenstander: KoppelSpeler = new KoppelSpeler();
    metWit: boolean = false;
    uitslag: Uitslag = new Uitslag();

    constructor(wed?: PouleKoppelWedstrijd) {
        if (wed) {
            this.tegPouleKoppelId = wed.tegPouleKoppelId;
            this.tegenstander = wed.tegenstander;
            this.metWit = wed.metWit;
            this.uitslag = wed.uitslag;
            this.volgNr = wed.volgNr;
        }
    }
}
