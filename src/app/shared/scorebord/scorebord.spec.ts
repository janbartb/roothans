import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scorebord } from './scorebord';

describe('Scorebord', () => {
  let component: Scorebord;
  let fixture: ComponentFixture<Scorebord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scorebord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Scorebord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
