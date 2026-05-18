import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfvalRondePlanner } from './afval-ronde-planner';

describe('AfvalRondePlanner', () => {
  let component: AfvalRondePlanner;
  let fixture: ComponentFixture<AfvalRondePlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfvalRondePlanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfvalRondePlanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
