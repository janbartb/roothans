import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Finales16Overzicht } from './finales16-overzicht';

describe('Finales16Overzicht', () => {
  let component: Finales16Overzicht;
  let fixture: ComponentFixture<Finales16Overzicht>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Finales16Overzicht]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Finales16Overzicht);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
