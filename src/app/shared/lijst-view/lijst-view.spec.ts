import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LijstView } from './lijst-view';

describe('LijstView', () => {
  let component: LijstView;
  let fixture: ComponentFixture<LijstView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LijstView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LijstView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
