import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWideStatus } from './scorebord-wide-status';

describe('ScorebordWideStatus', () => {
  let component: ScorebordWideStatus;
  let fixture: ComponentFixture<ScorebordWideStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWideStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWideStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
