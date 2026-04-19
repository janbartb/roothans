import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWideLaatste5 } from './scorebord-wide-laatste5';

describe('ScorebordWideLaatste5', () => {
  let component: ScorebordWideLaatste5;
  let fixture: ComponentFixture<ScorebordWideLaatste5>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWideLaatste5]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWideLaatste5);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
