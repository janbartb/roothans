import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoulesOverview } from './poules-overview';

describe('PoulesOverview', () => {
  let component: PoulesOverview;
  let fixture: ComponentFixture<PoulesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoulesOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoulesOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
