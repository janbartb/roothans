import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesSpeeldagen } from './matches-speeldagen';

describe('MatchesSpeeldagen', () => {
  let component: MatchesSpeeldagen;
  let fixture: ComponentFixture<MatchesSpeeldagen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesSpeeldagen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesSpeeldagen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
