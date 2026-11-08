import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvzSpeeldagWide } from './ovz-speeldag-wide';

describe('OvzSpeeldagWide', () => {
  let component: OvzSpeeldagWide;
  let fixture: ComponentFixture<OvzSpeeldagWide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvzSpeeldagWide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvzSpeeldagWide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
