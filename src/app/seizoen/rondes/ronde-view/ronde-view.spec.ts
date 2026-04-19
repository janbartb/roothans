import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RondeView } from './ronde-view';

describe('RondeView', () => {
  let component: RondeView;
  let fixture: ComponentFixture<RondeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RondeView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RondeView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
