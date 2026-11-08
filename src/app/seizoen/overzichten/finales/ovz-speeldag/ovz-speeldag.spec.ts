import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvzSpeeldag } from './ovz-speeldag';

describe('OvzSpeeldag', () => {
  let component: OvzSpeeldag;
  let fixture: ComponentFixture<OvzSpeeldag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvzSpeeldag]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvzSpeeldag);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
