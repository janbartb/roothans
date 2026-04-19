import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondeMatch } from './poule-ronde-match';

describe('PouleRondeMatch', () => {
  let component: PouleRondeMatch;
  let fixture: ComponentFixture<PouleRondeMatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondeMatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondeMatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
