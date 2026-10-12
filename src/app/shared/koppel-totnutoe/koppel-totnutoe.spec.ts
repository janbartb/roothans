import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KoppelTotnutoe } from './koppel-totnutoe';

describe('KoppelTotnutoe', () => {
  let component: KoppelTotnutoe;
  let fixture: ComponentFixture<KoppelTotnutoe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KoppelTotnutoe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KoppelTotnutoe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
