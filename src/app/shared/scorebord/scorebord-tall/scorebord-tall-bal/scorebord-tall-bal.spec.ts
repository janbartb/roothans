import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTallBal } from './scorebord-tall-bal';

describe('ScorebordTallBal', () => {
  let component: ScorebordTallBal;
  let fixture: ComponentFixture<ScorebordTallBal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTallBal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTallBal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
