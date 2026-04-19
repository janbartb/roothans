import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWedSpel1 } from './scorebord-wed-spel1';

describe('ScorebordWedSpel1', () => {
  let component: ScorebordWedSpel1;
  let fixture: ComponentFixture<ScorebordWedSpel1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWedSpel1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWedSpel1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
