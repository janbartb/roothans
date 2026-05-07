import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfvalRondePlanning } from './afval-ronde-planning';

describe('AfvalRondePlanning', () => {
  let component: AfvalRondePlanning;
  let fixture: ComponentFixture<AfvalRondePlanning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfvalRondePlanning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfvalRondePlanning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
