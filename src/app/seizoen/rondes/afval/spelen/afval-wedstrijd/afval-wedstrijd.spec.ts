import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfvalWedstrijd } from './afval-wedstrijd';

describe('AfvalWedstrijd', () => {
  let component: AfvalWedstrijd;
  let fixture: ComponentFixture<AfvalWedstrijd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfvalWedstrijd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfvalWedstrijd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
