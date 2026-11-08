import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvzPoule } from './ovz-poule';

describe('OvzPoule', () => {
  let component: OvzPoule;
  let fixture: ComponentFixture<OvzPoule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvzPoule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvzPoule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
