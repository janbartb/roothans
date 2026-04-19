import { Injectable } from '@angular/core';
import { Alert } from '../model/misc';

@Injectable({
    providedIn: 'root',
})
export class Alerts {
    visible: boolean = false;
    alert: Alert = new Alert();

    constructor() {}

    showAlert(msg: string, type: string, dur?: number) {
        if (type == 'error') {
            console.error(msg);
        }
        this.alert.text = msg;
        this.alert.type = type;
        this.alert.duration = dur ? dur : 0;
        this.visible = true;
        if (!this.alert.duration && this.alert.type != 'error') {
            this.alert.duration = 4;
        } 
        if (this.alert.duration) {
            setTimeout(() => {
                this.hideAlert();
            }, this.alert.duration * 1000);
        }
    }

    hideAlert() {
        this.visible = false;
    }

    showInfo(msg: string, dur?: number) {
        this.showAlert(msg, 'info', dur);
    }

    showSuccess(msg: string, dur?: number) {
        this.showAlert(msg, 'success', dur);
    }

    showWarning(msg: string, dur?: number) {
        this.showAlert(msg, 'warning', dur);
    }

    showError(err: string) {
        let txt = err.toString();
        if (txt.includes('no such file or directory')) {
            txt = txt.replace('ENOENT: no such file or directory, open', 'bestand of map');
            txt += ' niet gevonden.';
        }
        this.showAlert(txt, 'error');
    }

    private getClass(type: string): string {
        return 'alert ' + type;
    }
}
