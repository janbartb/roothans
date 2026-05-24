import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RondeKoppelView } from './ronde-koppel-view';

describe('RondeKoppelView', () => {
  let component: RondeKoppelView;
  let fixture: ComponentFixture<RondeKoppelView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RondeKoppelView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RondeKoppelView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
