import { Uitslag } from "./misc";
import { KoppelSpeler } from "./speler";

export class Koppel {
    kopId: string = '';
    uigeschakeld: boolean = false;
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
    uitslag: Uitslag = new Uitslag();
    totNuToe: Uitslag = new Uitslag(); 
    matchUitslagen: MatchUitslag[] = [];
}

export class MatchUitslag {
    splKoppelId: string = '';
    tegKoppelId: string = '';
    volgNr: number = 0;
    datum: string = '';
    barrageWinst: boolean = false;
    uitslag: Uitslag = new Uitslag();
    wedUitslagen: WedstrijdUitslag[] = [];

    constructor(splKoppel: RondeKoppel, tegKoppel: RondeKoppel) {
        this.splKoppelId = splKoppel.kopId;
        this.tegKoppelId = tegKoppel.kopId;
        this.wedUitslagen.push(new WedstrijdUitslag(splKoppel.spelers[0].splId, tegKoppel.spelers[0].splId));
        this.wedUitslagen.push(new WedstrijdUitslag(splKoppel.spelers[1].splId, tegKoppel.spelers[1].splId));
    }
}

export class WedstrijdUitslag {
    splId: string = '';
    tegId: string = '';
    metWit: boolean = false;
    uitslag: Uitslag = new Uitslag;

    constructor(sid: string, tid: string) {
        this.splId = sid;
        this.tegId = tid;
    }
}