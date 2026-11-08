import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Overzichten } from './overzichten';

describe('Overzichten', () => {
  let component: Overzichten;
  let fixture: ComponentFixture<Overzichten>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Overzichten]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Overzichten);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
