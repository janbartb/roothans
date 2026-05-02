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
