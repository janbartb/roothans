import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Headers {
    urlHistory: string[] = [];
    title: string = 'Driebanden -koppel- tournooi';
    subtitle: string = '';
    seizoen: string = '';
    datum: string = '';

    setTitles(t: string, subt: string) {
        this.title = t;
        this.subtitle = subt;
    }

}
