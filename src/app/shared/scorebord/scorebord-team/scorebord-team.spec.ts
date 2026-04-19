import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTeam } from './scorebord-team';

describe('ScorebordTeam', () => {
  let component: ScorebordTeam;
  let fixture: ComponentFixture<ScorebordTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTeam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
