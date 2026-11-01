import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesSpeeldagKwart } from './matches-speeldag-kwart';

describe('MatchesSpeeldagKwart', () => {
  let component: MatchesSpeeldagKwart;
  let fixture: ComponentFixture<MatchesSpeeldagKwart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesSpeeldagKwart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesSpeeldagKwart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
