import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTallExtra } from './scorebord-tall-extra';

describe('ScorebordTallExtra', () => {
  let component: ScorebordTallExtra;
  let fixture: ComponentFixture<ScorebordTallExtra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTallExtra]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTallExtra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
