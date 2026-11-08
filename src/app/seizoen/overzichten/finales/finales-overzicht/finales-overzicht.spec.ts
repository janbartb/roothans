import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalesOverzicht } from './finales-overzicht';

describe('FinalesOverzicht', () => {
  let component: FinalesOverzicht;
  let fixture: ComponentFixture<FinalesOverzicht>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalesOverzicht]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalesOverzicht);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
