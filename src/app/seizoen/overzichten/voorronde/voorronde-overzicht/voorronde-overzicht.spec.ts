import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoorrondeOverzicht } from './voorronde-overzicht';

describe('VoorrondeOverzicht', () => {
  let component: VoorrondeOverzicht;
  let fixture: ComponentFixture<VoorrondeOverzicht>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoorrondeOverzicht]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoorrondeOverzicht);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
