import { Btn } from "./misc";
import { PouleKoppelSpeler } from "./ronde";
import { WedSpeler } from "./wedstrijd";

export class ConfirmEndOfMatchDialog {
    acceptButton: Btn = new Btn('Enter', 'Ja');
    rejectButton: Btn = new Btn('Esc', 'Nee');
}

export class SpelerNamenDialog {
    spelers: SpelerNamen[] = [];
    selSpelerId: string = '';

    acceptButton: Btn = new Btn('Enter', 'Ja');
    rejectButton: Btn = new Btn('Esc', 'Nee');
}

export class SpelerNamen {
    splId: string = '';
    splNaam: string = '';
    splBordNaam: string = '';
    splSpreekNaam: string = '';

    constructor(speler: WedSpeler) {
        this.splId = speler.splId;
        this.splNaam = speler.splNaam;
        this.splBordNaam = speler.splBordNaam;
        this.splSpreekNaam = speler.splSpreekNaam;    
    }
}
