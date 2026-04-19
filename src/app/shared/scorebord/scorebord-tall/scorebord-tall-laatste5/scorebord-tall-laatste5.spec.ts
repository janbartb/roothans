import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTallLaatste5 } from './scorebord-tall-laatste5';

describe('ScorebordTallLaatste5', () => {
  let component: ScorebordTallLaatste5;
  let fixture: ComponentFixture<ScorebordTallLaatste5>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTallLaatste5]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTallLaatste5);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
