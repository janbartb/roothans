import { Btn } from "./misc";
import { WedSpeler } from "./wedstrijd";

export class ConfirmDialogType {
    title: string = '';
    texts: string[] = [];
    followUp: string = '';
    open: boolean = false;

    constructor(title: string, texts?: string[]) {
        this.title = title;
        if (texts) {
            this.texts = texts;
        }
    }
}

export class ConfirmEndOfMatchDialog {
    title: string = 'opslaan wedstrijd';
    texts: string[] = ['Uitslag van wedstrijd opslaan?'];
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
