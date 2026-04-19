export class Alert {
    text: string = '';
    type: string = '';
    duration: number = 0;
}

export class Btn {
    id: string = '';
    key: string = '';
    text: string = '';
    clicked: boolean = false;

    constructor(id: string, txt: string, key?: string) {
        this.id = id;
        this.text = txt;
        if (key) {
            this.key = key;
        }
    }
}
