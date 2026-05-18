import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeeldagView } from './speeldag-view';

describe('SpeeldagView', () => {
  let component: SpeeldagView;
  let fixture: ComponentFixture<SpeeldagView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeeldagView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeeldagView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
