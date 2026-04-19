import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Seizoen } from './seizoen';

describe('Seizoen', () => {
  let component: Seizoen;
  let fixture: ComponentFixture<Seizoen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Seizoen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Seizoen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
