import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTallStand } from './scorebord-tall-stand';

describe('ScorebordTallStand', () => {
  let component: ScorebordTallStand;
  let fixture: ComponentFixture<ScorebordTallStand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTallStand]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTallStand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
