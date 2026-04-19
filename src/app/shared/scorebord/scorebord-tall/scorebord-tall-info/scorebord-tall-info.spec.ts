import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTallInfo } from './scorebord-tall-info';

describe('ScorebordTallInfo', () => {
  let component: ScorebordTallInfo;
  let fixture: ComponentFixture<ScorebordTallInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTallInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTallInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
