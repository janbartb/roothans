import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DagenNiet } from './dagen-niet';

describe('DagenNiet', () => {
  let component: DagenNiet;
  let fixture: ComponentFixture<DagenNiet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DagenNiet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DagenNiet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
