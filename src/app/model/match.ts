import { Ronde, RondeKoppel } from "./ronde";

export class Match {
    ronde: Ronde = new Ronde(0, '', '', 0, '');
    pouleId: string = '';
    koppels: RondeKoppel[] = [];
}
