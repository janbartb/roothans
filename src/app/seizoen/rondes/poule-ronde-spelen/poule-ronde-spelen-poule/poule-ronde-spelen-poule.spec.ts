import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleRondeSpelenPoule } from './poule-ronde-spelen-poule';

describe('PouleRondeSpelenPoule', () => {
  let component: PouleRondeSpelenPoule;
  let fixture: ComponentFixture<PouleRondeSpelenPoule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleRondeSpelenPoule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleRondeSpelenPoule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
