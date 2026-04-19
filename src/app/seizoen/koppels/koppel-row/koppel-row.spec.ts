import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KoppelRow } from './koppel-row';

describe('KoppelRow', () => {
  let component: KoppelRow;
  let fixture: ComponentFixture<KoppelRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KoppelRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KoppelRow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
