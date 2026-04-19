import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondePlanning } from './poule-ronde-planning';

describe('PouleRondePlanning', () => {
  let component: PouleRondePlanning;
  let fixture: ComponentFixture<PouleRondePlanning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondePlanning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondePlanning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
