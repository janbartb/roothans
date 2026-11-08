import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoyennesOverzicht } from './moyennes-overzicht';

describe('MoyennesOverzicht', () => {
  let component: MoyennesOverzicht;
  let fixture: ComponentFixture<MoyennesOverzicht>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoyennesOverzicht]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoyennesOverzicht);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
