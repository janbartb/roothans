import { Injectable } from '@angular/core';

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
