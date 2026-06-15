import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesSpeeldagenR2 } from './matches-speeldagen-r2';

describe('MatchesSpeeldagenR2', () => {
  let component: MatchesSpeeldagenR2;
  let fixture: ComponentFixture<MatchesSpeeldagenR2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesSpeeldagenR2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesSpeeldagenR2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
