import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DagenOverview } from './dagen-overview';

describe('DagenOverview', () => {
  let component: DagenOverview;
  let fixture: ComponentFixture<DagenOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DagenOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DagenOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
