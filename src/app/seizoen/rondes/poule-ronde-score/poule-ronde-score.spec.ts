import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondeScore } from './poule-ronde-score';

describe('PouleRondeScore', () => {
  let component: PouleRondeScore;
  let fixture: ComponentFixture<PouleRondeScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondeScore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondeScore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
