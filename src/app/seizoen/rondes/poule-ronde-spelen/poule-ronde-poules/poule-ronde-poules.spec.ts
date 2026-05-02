import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondePoules } from './poule-ronde-poules';

describe('PouleRondePoules', () => {
  let component: PouleRondePoules;
  let fixture: ComponentFixture<PouleRondePoules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondePoules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondePoules);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
