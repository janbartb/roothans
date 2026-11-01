import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EindResultaat } from './eind-resultaat';

describe('EindResultaat', () => {
  let component: EindResultaat;
  let fixture: ComponentFixture<EindResultaat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EindResultaat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EindResultaat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
