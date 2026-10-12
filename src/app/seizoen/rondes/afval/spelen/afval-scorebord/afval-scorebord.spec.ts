import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfvalScorebord } from './afval-scorebord';

describe('AfvalScorebord', () => {
  let component: AfvalScorebord;
  let fixture: ComponentFixture<AfvalScorebord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfvalScorebord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfvalScorebord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
