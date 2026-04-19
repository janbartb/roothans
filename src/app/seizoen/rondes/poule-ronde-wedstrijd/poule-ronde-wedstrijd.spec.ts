import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondeWedstrijd } from './poule-ronde-wedstrijd';

describe('PouleRondeWedstrijd', () => {
  let component: PouleRondeWedstrijd;
  let fixture: ComponentFixture<PouleRondeWedstrijd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondeWedstrijd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondeWedstrijd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
