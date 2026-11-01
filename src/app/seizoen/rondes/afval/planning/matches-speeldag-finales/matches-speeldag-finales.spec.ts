import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesSpeeldagFinales } from './matches-speeldag-finales';

describe('MatchesSpeeldagFinales', () => {
  let component: MatchesSpeeldagFinales;
  let fixture: ComponentFixture<MatchesSpeeldagFinales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesSpeeldagFinales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesSpeeldagFinales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
