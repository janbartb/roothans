import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWedSpel3 } from './scorebord-wed-spel3';

describe('ScorebordWedSpel3', () => {
  let component: ScorebordWedSpel3;
  let fixture: ComponentFixture<ScorebordWedSpel3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWedSpel3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWedSpel3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
