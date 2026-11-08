import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsluitenSeizoen } from './afsluiten-seizoen';

describe('AfsluitenSeizoen', () => {
  let component: AfsluitenSeizoen;
  let fixture: ComponentFixture<AfsluitenSeizoen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsluitenSeizoen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsluitenSeizoen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
