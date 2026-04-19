import { SpeelDag } from "./seizoen";
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
