import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchView } from './match-view';

describe('MatchView', () => {
  let component: MatchView;
  let fixture: ComponentFixture<MatchView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
