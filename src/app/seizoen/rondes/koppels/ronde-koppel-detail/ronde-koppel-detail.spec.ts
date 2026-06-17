import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RondeKoppelDetail } from './ronde-koppel-detail';

describe('RondeKoppelDetail', () => {
  let component: RondeKoppelDetail;
  let fixture: ComponentFixture<RondeKoppelDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RondeKoppelDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RondeKoppelDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
