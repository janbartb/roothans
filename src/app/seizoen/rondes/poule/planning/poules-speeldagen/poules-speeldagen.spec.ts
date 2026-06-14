import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoulesSpeeldagen } from './poules-speeldagen';

describe('PoulesSpeeldagen', () => {
  let component: PoulesSpeeldagen;
  let fixture: ComponentFixture<PoulesSpeeldagen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoulesSpeeldagen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoulesSpeeldagen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
