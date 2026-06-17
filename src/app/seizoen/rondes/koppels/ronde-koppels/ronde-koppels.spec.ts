import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RondeKoppels } from './ronde-koppels';

describe('RondeKoppels', () => {
  let component: RondeKoppels;
  let fixture: ComponentFixture<RondeKoppels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RondeKoppels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RondeKoppels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
