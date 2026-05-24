import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleOverview } from './poule-overview';

describe('PouleOverview', () => {
  let component: PouleOverview;
  let fixture: ComponentFixture<PouleOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
