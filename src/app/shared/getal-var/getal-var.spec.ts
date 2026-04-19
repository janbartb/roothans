import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetalVar } from './getal-var';

describe('GetalVar', () => {
  let component: GetalVar;
  let fixture: ComponentFixture<GetalVar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetalVar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetalVar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
