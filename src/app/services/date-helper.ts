import { Injectable } from '@angular/core';
import { Periode } from '../model/misc';
import { SpeelWeek, SpeelWeekDag } from '../model/seizoen';

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

    getWeekDaysInPeriod(dayOfWeek: number, periode: Periode): string[] {
        let dat = '';
        let result: string[] = [];
        let parts = new DateParts(periode.van);
        let d = parts.date;
        // Get the first weekDay in the month
        while (d.getDay() != dayOfWeek) {
            d.setDate(d.getDate() + 1);
        }
        dat = d.toISOString().substring(0, 10);
        // Get the other same weekDays in the month
        while (dat < periode.tot) {
            result.push(dat);
            d.setDate(d.getDate() + 7);
            dat = d.toISOString().substring(0, 10);
        }
        return result;
    }

    getGivenNrOfWeekDaysStartingFrom(dayOfWeek: number, nrOfDays: number, startFrom: string, notInPast?: boolean): string[] {
        if (nrOfDays < 1) {
            return [];
        }
        let dat = '';
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

    getSpeelweken(periode: Periode, speeldagNrs: number[], isFinaleDag?: boolean): SpeelWeek[] {
        let result: SpeelWeek[] = [];
        let start = periode.van;
        while (start < periode.tot) {
            let dat = start;
            let parts = new DateParts(dat);
            let d = parts.date;
            let week = new SpeelWeek();
            week.weekNr = this.getWeekNr(new DateParts(dat).date);
            week.startdat = start;
            [0,1,2,3,4,5,6].forEach(dagNr => {
                d.setDate(d.getDate() + (dagNr == 0 ? 0 : 1));
                dat = d.toISOString().substring(0, 10);
                let speeldag = new SpeelWeekDag();
                speeldag.dagNr = dagNr;
                speeldag.dagNaam = this.getDagNaam(dagNr);
                speeldag.dagDatum = dat;
                speeldag.isSpeeldag = speeldagNrs.includes(dagNr);
                week.weekDagen.push(speeldag);
                if (dagNr == 6) {
                    week.einddat = dat;
                }
            });
            result.push(week);
            d.setDate(d.getDate() + 1);
            start = d.toISOString().substring(0, 10);
        }
        return result;
    }

    getRondePeriodes(seizoen: number): Periode[] {
        let result: Periode[] = [];
        let d = new Date(seizoen, 0, 1, 12);
        const dayNr = d.getDay();
        if (dayNr > 0) {
            d.setDate(d.getDate() + (7 - dayNr));
        }
        // voorronde
        let periode = new Periode();
        periode.van = d.toISOString().substring(0, 10);
        d.setDate(d.getDate() + 28);
        periode.tot = d.toISOString().substring(0, 10);
        result.push(periode);
        // 16e
        periode = new Periode();
        periode.van = d.toISOString().substring(0, 10);
        d.setDate(d.getDate() + 21);
        periode.tot = d.toISOString().substring(0, 10);
        result.push(periode);
        // 8e
        periode = new Periode();
        periode.van = d.toISOString().substring(0, 10);
        d.setDate(d.getDate() + 7);
        periode.tot = d.toISOString().substring(0, 10);
        result.push(periode);
        // 4e
        periode = new Periode();
        periode.van = d.toISOString().substring(0, 10);
        d.setDate(d.getDate() + 7);
        periode.tot = d.toISOString().substring(0, 10);
        result.push(periode);
        // finale
        result.push(periode);
        return result;
    }

    getDagNaam(dagNr: number): string {
        if (dagNr < 0 || dagNr > 6) {
            return 'Error:' + dagNr;
        }
        return this.dagNamen[dagNr];
    }

    dateReverse(dat: string): string {
        if (!dat || dat == '') {
            return '';
        }
        return `${dat.substring(8)}-${dat.substring(5,7)}-${dat.substring(0,4)}`;
    }

    private getWeekNr(dat: Date): number {
        // Thursday in current week decides the year.
        dat.setDate(dat.getDate() + 3 - (dat.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(dat.getFullYear(), 0, 4, 12);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((dat.getTime() - week1.getTime()) / 86400000
                              - 3 + (week1.getDay() + 6) % 7) / 7);      
    }

}
