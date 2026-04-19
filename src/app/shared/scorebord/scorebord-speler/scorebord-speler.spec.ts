import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordSpeler } from './scorebord-speler';

describe('ScorebordSpeler', () => {
  let component: ScorebordSpeler;
  let fixture: ComponentFixture<ScorebordSpeler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordSpeler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordSpeler);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
