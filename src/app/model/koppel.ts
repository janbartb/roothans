import { Uitslag } from "./misc";
import { KoppelSpeler } from "./speler";

export class Koppel {
    kopId: string = '';
    uitgeschakeld: boolean = false;
    spelers: KoppelSpeler[] = [];
    kopMoyenne: number = 0;
    voorkeurDagen: number[] = [];

    constructor() {
        this.spelers.push(new KoppelSpeler());
        this.spelers.push(new KoppelSpeler());
    }
}

export class RondeKoppel extends Koppel {
    dagenNiet: string[] = [];
    pouleId: string = '';
    pouleRang: number = 0;
    pouleKplId: string = '';
    afgevallen: boolean = false;
    ingepland: boolean = false;
    splUitslagen: KoppelSpelerUitslagen[] = [];
    uitslag: Uitslag = new Uitslag();
    totNuToe: Uitslag = new Uitslag(); 
    matches: KoppelMatch[] = [];

    constructor() {
        super();
        this.splUitslagen.push(new KoppelSpelerUitslagen());
        this.splUitslagen.push(new KoppelSpelerUitslagen());
    }
}

export class KoppelSpelerUitslagen {
    uitslag: Uitslag = new Uitslag();
    totNuToe: Uitslag = new Uitslag(); 
}

export class KoppelMatch {
    splKoppelId: string = '';
    tegKoppelId: string = '';
    volgNr: number = 0;
    datum: string = '';
    barrageWinst: boolean = false;
    uitslag: Uitslag = new Uitslag();
    wedstrijden: KoppelWedstrijd[] = [];

    constructor(splKoppel: RondeKoppel, tegKoppel: RondeKoppel) {
        this.splKoppelId = splKoppel.kopId;
        this.tegKoppelId = tegKoppel.kopId;
        this.wedstrijden.push(new KoppelWedstrijd(splKoppel, tegKoppel, 0));
        this.wedstrijden.push(new KoppelWedstrijd(splKoppel, tegKoppel, 1));
    }
}

export class KoppelWedstrijd {
    splKoppelId: string = '';
    tegKoppelId: string = '';
    splId: string = '';
    tegId: string = '';
    metWit: boolean = false;
    uitslag: Uitslag = new Uitslag();

    constructor(splKoppel: RondeKoppel, tegKoppel: RondeKoppel, idxSpeler: number) {
        this.splKoppelId = splKoppel.kopId;
        this.tegKoppelId = tegKoppel.kopId;
        this.splId = splKoppel.spelers[idxSpeler].splId;
        this.tegId = tegKoppel.spelers[idxSpeler].splId;
    }
}