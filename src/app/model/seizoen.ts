import { Poule, RondeMatch } from "./ronde";

export class Seizoen {
    id: number = 0;
    maxKoppels: number = 32;
    maxKoppelsPerPoule: number = 4;
    pntWinst: number = 2;
    pntGelijk: number = 1;
    pntMoyenne: number = 0;
    huidigeRonde: number = 0;
    speelDagen: SpeelDag[] = [];
}

export class SpeelDag {
    dagNr: number = -1;
    dagNaam: string = '';
    selected?: boolean = false;

    constructor(nr: number, naam: string, sel?: boolean) {
        this.dagNr = nr;
        this.dagNaam = naam;
        if (sel) {
            this.selected = true;
        }
    }
}

export class SpeelWeek {
    weekNr: number = 0;
    startdat: string = '';
    einddat: string = '';
    weekDagen: SpeelWeekDag[] = [];
}

export class SpeelWeekDag {
    dagNr: number = -1;
    dagNaam: string = '';
    dagDatum: string = '';
    isSpeeldag: boolean = false;
    selectable: boolean = false;
    poule: Poule | undefined = undefined;
    matches: RondeMatch[] = [];
}