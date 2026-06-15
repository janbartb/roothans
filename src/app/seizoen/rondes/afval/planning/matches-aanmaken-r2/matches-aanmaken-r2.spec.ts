import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesAanmakenR2 } from './matches-aanmaken-r2';

describe('MatchesAanmakenR2', () => {
  let component: MatchesAanmakenR2;
  let fixture: ComponentFixture<MatchesAanmakenR2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesAanmakenR2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesAanmakenR2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
