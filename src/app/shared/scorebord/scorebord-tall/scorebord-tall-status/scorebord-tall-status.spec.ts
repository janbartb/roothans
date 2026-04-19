import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTallStatus } from './scorebord-tall-status';

describe('ScorebordTallStatus', () => {
  let component: ScorebordTallStatus;
  let fixture: ComponentFixture<ScorebordTallStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTallStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTallStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
