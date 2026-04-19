import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RondePouleView } from './ronde-poule-view';

describe('RondePouleView', () => {
  let component: RondePouleView;
  let fixture: ComponentFixture<RondePouleView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RondePouleView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RondePouleView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
