export class Status {
    gepland: boolean = false;
    gestart: boolean = false;
    gereed: boolean = false;
}

export class Uitslag {
    handicap: number = 0;
    car: number = 0;
    brt: number = 0;
    ser: number = 0;
    moy: number = 0;
    pnt: number = 0;
    sco: number[] = [];
    weds: number = 0;
    winst: number = 0;
    gelijk: number = 0;
    verlies: number = 0;
    barrage: number = 0;
}

export class Alert {
    text: string = '';
    type: string = '';
    duration: number = 0;
}

export class Btn {
    id: string = '';
    text: string = '';
    key: BtnKey = new BtnKey('', -1);
    default: boolean = false;
    clicked: boolean = false;

    constructor(id: string, txt: string, key?: string, keyPos?: number) {
        this.id = id;
        this.text = txt;
        if (key) {
            this.key = new BtnKey(key, -1);
            if (key == 'enter') {
                this.default = true;
            }
            else if (keyPos && keyPos > 0) {
                this.key.pos = keyPos;
            }
        }
    }
}

export class BtnKey {
    key: string = '';
    pos: number = -1;

    constructor(k: string, p: number) {
        this.key = k;
        this.pos = p;
    }
}

export class Periode {
    // periode is inclusief van en exclusief tot
    van: string = '';
    tot: string = '';
}
