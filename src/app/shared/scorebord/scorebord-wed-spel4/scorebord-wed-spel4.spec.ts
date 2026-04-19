import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWedSpel4 } from './scorebord-wed-spel4';

describe('ScorebordWedSpel4', () => {
  let component: ScorebordWedSpel4;
  let fixture: ComponentFixture<ScorebordWedSpel4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWedSpel4]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWedSpel4);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
