import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondePlanningData } from './poule-ronde-planning-data';

describe('PouleRondePlanningData', () => {
  let component: PouleRondePlanningData;
  let fixture: ComponentFixture<PouleRondePlanningData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondePlanningData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondePlanningData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
