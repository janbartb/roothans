import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalesOverview } from './finales-overview';

describe('FinalesOverview', () => {
  let component: FinalesOverview;
  let fixture: ComponentFixture<FinalesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalesOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalesOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
