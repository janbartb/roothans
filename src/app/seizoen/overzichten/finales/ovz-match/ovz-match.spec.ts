import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvzMatch } from './ovz-match';

describe('OvzMatch', () => {
  let component: OvzMatch;
  let fixture: ComponentFixture<OvzMatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvzMatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvzMatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
