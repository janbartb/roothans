export class Speler {
    id: string = '';
    vnaam: string = '';
    tvoeg: string = '';
    anaam: string = '';
    snaam: string = '';
    extra: string = '';
    moyenne: number = 0;
    email: string = '';
}

export class KoppelSpeler {
    splId: string = '';
    splNaam: string = '';
    splBNaam: string = '';
    splSnaam: string = '';
    splMoy: number = 0;
    splHand: number = 0;
}

export class LijstSpeler {
    speler: KoppelSpeler = new KoppelSpeler
    score: number[] = [];
    scores: LijstScore[] = [];

    constructor(spl?: KoppelSpeler) {
        if (spl) {
            this.speler = spl;
        }
    }
}

export class LijstScore {
    brt: number = 0;
    car: string = '';
    tot: string = '';
    filler: boolean = true;

    constructor(b: number) {
        this.brt = b;
    }
}

export class SpelerResultaat {
    id: string = '';
    naam: string = '';
    splMoy: number = 0;
    kopId: string = '';
    pouleId: string = '';
    afvalNr: number = 0;
    afvalOms: string = '';
    aantWed: number = 0;
    aantW: number = 0;
    aantG: number = 0;
    aantV: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    totMoy: number = 0;
    serie: number = 0;
    totPerc: number = 0;
}
export class KoppelResultaat {
    id: string = '';
    spelers: KoppelResultaatSpeler[] = [];
    kopMoy: number = 0;
    pouleId: string = '';
    afvalNr: number = 0;
    afvalOms: string = '';
    aantMat: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    totMoy: number = 0;
    serie: number = 0;
    totPerc: number = 0;
}
export class KoppelResultaatSpeler {
    id: string = '';
    naam: string = '';

    constructor(spl: KoppelSpeler) {
        this.id = spl.splId;
        this.naam = spl.splNaam;
    }
}
