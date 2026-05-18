import { Injectable } from '@angular/core';

class DateParts {
    year: number = 2000;
    month: number = 0;
    day: number = 1;
    weekDay: number = 0;
    hours: number = 12;
    date: Date = new Date();

    constructor(isoDate: string) {
        this.year = Number(isoDate.substring(0, 4));
        this.month = Number(isoDate.substring(5, 7)) - 1;
        this.day = Number(isoDate.substring(8));
        this.date = new Date(this.year, this.month, this.day, 12);
        this.weekDay = this.date.getDay();
    }
}

@Injectable({
    providedIn: 'root',
})
export class DateHelper {

    private dagNamen: string[] = [
        'Zondag',
        'Maandag',
        'Dinsdag',
        'Woensdag',
        'Donderdag',
        'Vrijdag',
        'Zaterdag'
    ]

    getToday(): string {
        return new Date().toISOString().substring(0, 10);
    }

    getAllWeekDaysOfMonth(year: number, month: number, dayOfWeek: number): string[] {
        let result: string[] = [];
        let d = new Date(year, month, 1, 12);
        // Get the first weekDay in the month
        while (d.getDay() != dayOfWeek) {
            d.setDate(d.getDate() + 1);
        }
        // Get the other same weekDays in the month
        while (d.getMonth() === month) {
            result.push(d.toISOString().substring(0, 10));
            d.setDate(d.getDate() + 7);
        }
        return result;
    }

    getGivenNrOfWeekDaysStartingFrom(dayOfWeek: number, nrOfDays: number, startFrom: string, notInPast?: boolean): string[] {
        if (nrOfDays < 1) {
            return [];
        }
        let dat = '';
        let today = this.getToday();
        let result: string[] = [];
        let counter = 0;
        let parts = new DateParts(startFrom);
        let d = parts.date;
        // Get the first weekDay in the month
        while (d.getDay() != dayOfWeek) {
            d.setDate(d.getDate() + 1);
        }
        dat = d.toISOString().substring(0, 10);
        // Get the other same weekDays in the month
        while (counter < nrOfDays) {
            if (!notInPast || dat >= startFrom) {
                result.push(dat);
                counter++;
            }
            d.setDate(d.getDate() + 7);
            dat = d.toISOString().substring(0, 10);
        }
        return result;
    }

    getDagNaam(dagNr: number): string {
        if (dagNr < 0 || dagNr > 6) {
            return 'Error';
        }
        return this.dagNamen[dagNr];
    }

    dateReverse(dat: string): string {
        if (!dat || dat == '') {
            return '';
        }
        return `${dat.substring(8)}-${dat.substring(5,7)}-${dat.substring(0,4)}`;
    }

}
