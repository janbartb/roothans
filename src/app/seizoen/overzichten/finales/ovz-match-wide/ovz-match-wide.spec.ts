import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvzMatchWide } from './ovz-match-wide';

describe('OvzMatchWide', () => {
  let component: OvzMatchWide;
  let fixture: ComponentFixture<OvzMatchWide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvzMatchWide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvzMatchWide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
