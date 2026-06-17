import { RondeKoppel } from "./koppel";
import { Periode, Status } from "./misc";

export class Ronde {
    rndId: number = 0;
    rndNaam: string = '';
    rndType: string = '';
    rndBeurten: number = 0;
    fileNaam: string = '';
    status: Status = new Status();
    moyBepalen: boolean = false;
    periode: Periode = new Periode();

    constructor(id: number, naam: string, type: string, brt: number, file: string, moy?: boolean) {
        this.rndId = id;
        this.rndNaam = naam;
        this.rndType = type;
        this.rndBeurten = brt;
        this.fileNaam = file;
        if (moy) {
            this.moyBepalen = true;
        }
    }
}

export class SpeelRonde extends Ronde {
    koppels: RondeKoppel[] = [];
    poules: Poule[] = [];
    speelDagen: RondeSpeelDag[] = [];
    maxDagen: number = 0;
    maxMatchesPerDag: number = 4;
}

export class Poule {
    id: string = '';
    volgNr: number = 0;
    dagNr: number = -1;
    dagNaam: string = '';
    datum: string = '';
    koppelIds: string[] = [];
    koppels: RondeKoppel[] = [];
    status: Status = new Status();

    constructor(nrOfKoppels: number) {
        while(nrOfKoppels--) {
            this.koppelIds.push('');
            this.koppels.push(new RondeKoppel());
        }
    }
}

export class RondeSpeelDag {
    dagId: string = '';
    dagNr: number = -1;
    dagNaam: string = '';
    datum: string = '';
    status: Status = new Status();
    mogelijkeData: string[] = [];
    matches: RondeMatch[] = [];

    constructor(matchesPerDag: number) {
        let count = 0;
        while (count < matchesPerDag) {
            this.matches.push(new RondeMatch(new RondeKoppel(), new RondeKoppel()));
            count++;
        }
    }
}

export class RondeMatch {
    koppels: RondeKoppel[] = [];
    koppelIds: string[] = [];
    datum: string = '';

    constructor(a: RondeKoppel, b: RondeKoppel) {
        this.koppels.push(a);
        this.koppels.push(b);
        this.koppelIds.push(a.kopId);
        this.koppelIds.push(b.kopId);
    }
}
