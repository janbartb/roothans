import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Spelers } from './spelers';

describe('Spelers', () => {
  let component: Spelers;
  let fixture: ComponentFixture<Spelers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spelers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Spelers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
