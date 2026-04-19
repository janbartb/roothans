import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Koppels } from './koppels';

describe('Koppels', () => {
  let component: Koppels;
  let fixture: ComponentFixture<Koppels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Koppels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Koppels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
