import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWedSpel2 } from './scorebord-wed-spel2';

describe('ScorebordWedSpel2', () => {
  let component: ScorebordWedSpel2;
  let fixture: ComponentFixture<ScorebordWedSpel2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWedSpel2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWedSpel2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
