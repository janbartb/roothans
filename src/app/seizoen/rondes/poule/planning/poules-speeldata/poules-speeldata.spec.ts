import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoulesSpeeldata } from './poules-speeldata';

describe('PoulesSpeeldata', () => {
  let component: PoulesSpeeldata;
  let fixture: ComponentFixture<PoulesSpeeldata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoulesSpeeldata]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoulesSpeeldata);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
