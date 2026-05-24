import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoulesAanmaken } from './poules-aanmaken';

describe('PoulesAanmaken', () => {
  let component: PoulesAanmaken;
  let fixture: ComponentFixture<PoulesAanmaken>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoulesAanmaken]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoulesAanmaken);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
