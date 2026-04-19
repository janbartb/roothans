import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordSpelerWide } from './scorebord-speler-wide';

describe('ScorebordSpelerWide', () => {
  let component: ScorebordSpelerWide;
  let fixture: ComponentFixture<ScorebordSpelerWide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordSpelerWide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordSpelerWide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
