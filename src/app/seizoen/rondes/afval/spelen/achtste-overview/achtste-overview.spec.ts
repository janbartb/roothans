import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchtsteOverview } from './achtste-overview';

describe('AchtsteOverview', () => {
  let component: AchtsteOverview;
  let fixture: ComponentFixture<AchtsteOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchtsteOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchtsteOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
