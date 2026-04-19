import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWedSpel2x2 } from './scorebord-wed-spel2x2';

describe('ScorebordWedSpel2x2', () => {
  let component: ScorebordWedSpel2x2;
  let fixture: ComponentFixture<ScorebordWedSpel2x2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWedSpel2x2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWedSpel2x2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
