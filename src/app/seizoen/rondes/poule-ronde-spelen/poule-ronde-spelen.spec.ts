import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondeSpelen } from './poule-ronde-spelen';

describe('PouleRondeSpelen', () => {
  let component: PouleRondeSpelen;
  let fixture: ComponentFixture<PouleRondeSpelen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondeSpelen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondeSpelen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
