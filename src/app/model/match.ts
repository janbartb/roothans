export class Match {

}

export class Wedstrijd {
    wedGespeeld: boolean = false;
    wedSaved: boolean = false;
    vastAantBrt: number = 0;
    winstPunten: number = 0;
    gelijkPunten: number = 0;
    bovenMoyPunten: number = 0;
    spelers: WedSpeler[] = [];
}

export class WedSpeler {
    splId: string = '';
    splNaam: string = '';
    splBordNaam: string = '';
    splSpreekNaam: string = '';
    metWit: boolean = true;
    actief: boolean = false;
    handicap: number = 0;
    splTsMoy: number = 0;
    splTsBrt: number = 0;
    stand: WedSpelerStand = new WedSpelerStand();
}

export class WedSpelerStand {
    aantCar: number = 0;
    aantBrt: number = 0;
    gemiddelde: number = 0;
    hoogSer: number = 0;
    punten: number = 0;
    serie: number = 0;
    score: number[] = [];
    laatste5brt: number[] = [];
    voortgang: number = 0;
    enNog: number = 0;
    moyView: string = '0,000';
    percView: string = '0,00';
    serView: string = '0';
}

export class WedstrijdLeesResultaat {
    gevonden: boolean = false;
    wedstrijd!: Wedstrijd;
}
