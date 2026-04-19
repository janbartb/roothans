import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cijfer } from './cijfer';

describe('Cijfer', () => {
  let component: Cijfer;
  let fixture: ComponentFixture<Cijfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cijfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cijfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
