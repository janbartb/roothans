import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWideBal } from './scorebord-wide-bal';

describe('ScorebordWideBal', () => {
  let component: ScorebordWideBal;
  let fixture: ComponentFixture<ScorebordWideBal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWideBal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWideBal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
