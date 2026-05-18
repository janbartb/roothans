import { Ronde, PouleKoppel } from "./ronde";

export class Match {
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleId: string = '';
    koppels: PouleKoppel[] = [];
}
