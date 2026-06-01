import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleScorebord } from './poule-scorebord';

describe('PouleScorebord', () => {
  let component: PouleScorebord;
  let fixture: ComponentFixture<PouleScorebord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleScorebord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleScorebord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
