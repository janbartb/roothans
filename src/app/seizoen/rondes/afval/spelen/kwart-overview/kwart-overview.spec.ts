import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwartOverview } from './kwart-overview';

describe('KwartOverview', () => {
  let component: KwartOverview;
  let fixture: ComponentFixture<KwartOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KwartOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KwartOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
