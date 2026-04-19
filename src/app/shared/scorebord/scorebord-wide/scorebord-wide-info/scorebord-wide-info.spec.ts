import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordWideInfo } from './scorebord-wide-info';

describe('ScorebordWideInfo', () => {
  let component: ScorebordWideInfo;
  let fixture: ComponentFixture<ScorebordWideInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordWideInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordWideInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
