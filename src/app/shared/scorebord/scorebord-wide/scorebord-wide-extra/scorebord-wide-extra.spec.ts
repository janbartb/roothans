import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWideExtra } from './scorebord-wide-extra';

describe('ScorebordWideExtra', () => {
  let component: ScorebordWideExtra;
  let fixture: ComponentFixture<ScorebordWideExtra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWideExtra]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWideExtra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
