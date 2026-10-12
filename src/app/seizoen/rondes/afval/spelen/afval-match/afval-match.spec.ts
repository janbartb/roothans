import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfvalMatch } from './afval-match';

describe('AfvalMatch', () => {
  let component: AfvalMatch;
  let fixture: ComponentFixture<AfvalMatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfvalMatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfvalMatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
