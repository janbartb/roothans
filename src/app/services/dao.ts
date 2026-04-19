import { Injectable } from '@angular/core';
import { ApiResponse } from '../model/api-response';
import { Speler } from '../model/speler';
import { Koppel } from '../model/koppel';
import { AfvalRonde, Poule, PouleRonde, Ronde } from '../model/ronde';
import { Seizoen } from '../model/seizoen';

@Injectable({
    providedIn: 'root',
})
export class Dao {
    private apiUrl: string;
    private myHeaders: Headers = new Headers();
    private options = {};
    private allowed = false;

    constructor() {
        this.apiUrl = 'http://localhost:8080/rhapi';
        this.myHeaders.append("Content-Type", "application/json");
    }

    // KOPPELS

    async getKoppels(seizoen: string): Promise<Koppel[]> {
        const result: Koppel[] = await this.getResource(this.apiUrl + `/seizoenen/${seizoen}/koppels`);
        return result;
    }

    async saveKoppels(seizoen: string, koppels: Koppel[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/seizoenen/${seizoen}/koppels`, {
            method: 'POST',
            body: JSON.stringify(koppels),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // RONDES

    async getRondes(seizoen: string): Promise<Ronde[]> {
        const result: Ronde[] = await this.getResource(this.apiUrl + `/seizoenen/${seizoen}/rondes`);
        return result;
    }

    async getPouleRondeFile(seizoen: string, filenaam: string): Promise<PouleRonde> {
        const result: PouleRonde = await this.getResource(this.apiUrl + `/seizoenen/${seizoen}/rondes/file/${filenaam}`);
        return result;
    }

    async getAfvalRondeFile(seizoen: string, filenaam: string): Promise<AfvalRonde> {
        const result: AfvalRonde = await this.getResource(this.apiUrl + `/seizoenen/${seizoen}/rondes/file/${filenaam}`);
        return result;
    }

    async savePouleRondeFile(seizoen: string, filenaam: string, data: PouleRonde): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/seizoenen/${seizoen}/rondes/file/${filenaam}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async saveAfvalRondeFile(seizoen: string, filenaam: string, data: AfvalRonde): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/seizoenen/${seizoen}/rondes/file/${filenaam}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async createRondes(seizoen: string, rondes: Ronde[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/seizoenen/${seizoen}/rondes/aanmaken`, {
            method: 'POST',
            body: JSON.stringify(rondes),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async saveRondes(seizoen: string, rondes: Ronde[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/seizoenen/${seizoen}/rondes`, {
            method: 'POST',
            body: JSON.stringify(rondes),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // POULES

    async getPoules(seizoen: string): Promise<Poule[]> {
        const result: Poule[] = await this.getResource(this.apiUrl + `/seizoenen/${seizoen}/poules`);
        return result;
    }

    async savePoules(seizoen: string, poules: Poule[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/seizoenen/${seizoen}/poules`, {
            method: 'POST',
            body: JSON.stringify(poules),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // INIT SPELERS

    async getFiles(): Promise<string[]> {
        const result: string[] = await this.getResource(this.apiUrl + '/init/files');
        return result;
    }

    async getInitSpelers(): Promise<string> {
        const result: string = await this.getResourceAsTxt(this.apiUrl + '/init');
        return result;
    }

    async saveInitSpelers(spelers: Speler[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + '/init', {
            method: 'POST',
            body: JSON.stringify(spelers),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // SPELERS

    async getSpelers(): Promise<Speler[]> {
        const result: Speler[] = await this.getResource(this.apiUrl + '/spelers');
        return result;
    }

    async getSpeler(id: string): Promise<Speler> {
        const result: Speler = await this.getResource(this.apiUrl + '/spelers/' + id);
        return result;
    }

    async addSpelers(spelers: Speler[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + '/spelers', {
            method: 'POST',
            body: JSON.stringify(spelers),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateSpeler(speler: Speler): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/spelers/${speler.id}`, {
            method: 'PUT',
            body: JSON.stringify(speler),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateSpelers(spelers: Speler[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + '/spelers', {
            method: 'PUT',
            body: JSON.stringify(spelers),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteSpeler(speler: Speler): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/spelers/${speler.id}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // SEIZOENEN

    async getSeizoenen(): Promise<string[]> {
        const result: string[] = await this.getResource(this.apiUrl + '/seizoenen');
        return result;
    }

    async getSeizoenFile(seizoen: string): Promise<Seizoen> {
        const result: Seizoen = await this.getResource(this.apiUrl + `/seizoenen/${seizoen}/seizoen`);
        return result;
    }

    async saveSeizoenfile(seizoen: string, data: Seizoen): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/seizoenen/${seizoen}/seizoen`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async createSeizoen(seizoen: string): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + '/seizoenen', {
            method: 'POST',
            body: JSON.stringify([seizoen]),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // ALGEMEEN

    async getResource(url: string) {
        const response: Response = await fetch(url);
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json.data;
    }

    async getResourceAsTxt(url: string) {
        const response: Response = await fetch(url);
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json.data;
    }

}
