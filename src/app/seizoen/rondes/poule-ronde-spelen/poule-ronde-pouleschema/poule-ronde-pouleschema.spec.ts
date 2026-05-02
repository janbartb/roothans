import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondePouleschema } from './poule-ronde-pouleschema';

describe('PouleRondePouleschema', () => {
  let component: PouleRondePouleschema;
  let fixture: ComponentFixture<PouleRondePouleschema>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondePouleschema]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondePouleschema);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
