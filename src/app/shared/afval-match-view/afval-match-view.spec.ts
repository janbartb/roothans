import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfvalMatchView } from './afval-match-view';

describe('AfvalMatchView', () => {
  let component: AfvalMatchView;
  let fixture: ComponentFixture<AfvalMatchView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfvalMatchView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfvalMatchView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
