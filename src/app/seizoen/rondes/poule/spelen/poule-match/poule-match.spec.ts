import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleMatch } from './poule-match';

describe('PouleMatch', () => {
  let component: PouleMatch;
  let fixture: ComponentFixture<PouleMatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleMatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleMatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
