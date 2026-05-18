export class Status {
    gepland: boolean = false;
    gestart: boolean = false;
    gereed: boolean = false;
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
