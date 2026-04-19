import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWideStand } from './scorebord-wide-stand';

describe('ScorebordWideStand', () => {
  let component: ScorebordWideStand;
  let fixture: ComponentFixture<ScorebordWideStand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWideStand]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWideStand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
