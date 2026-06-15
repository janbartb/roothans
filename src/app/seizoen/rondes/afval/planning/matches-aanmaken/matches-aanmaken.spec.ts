import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesAanmaken } from './matches-aanmaken';

describe('MatchesAanmaken', () => {
  let component: MatchesAanmaken;
  let fixture: ComponentFixture<MatchesAanmaken>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesAanmaken]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesAanmaken);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
