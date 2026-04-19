import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Probeer } from './probeer';

describe('Probeer', () => {
  let component: Probeer;
  let fixture: ComponentFixture<Probeer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Probeer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Probeer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
