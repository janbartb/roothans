import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleWedstrijd } from './poule-wedstrijd';

describe('PouleWedstrijd', () => {
  let component: PouleWedstrijd;
  let fixture: ComponentFixture<PouleWedstrijd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleWedstrijd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleWedstrijd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
