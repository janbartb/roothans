import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoorkeurDagen } from './voorkeur-dagen';

describe('VoorkeurDagen', () => {
  let component: VoorkeurDagen;
  let fixture: ComponentFixture<VoorkeurDagen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoorkeurDagen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoorkeurDagen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
