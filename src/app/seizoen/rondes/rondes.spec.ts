import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rondes } from './rondes';

describe('Rondes', () => {
  let component: Rondes;
  let fixture: ComponentFixture<Rondes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rondes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rondes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
