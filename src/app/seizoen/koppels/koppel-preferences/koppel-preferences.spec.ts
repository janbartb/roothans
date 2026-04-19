import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KoppelPreferences } from './koppel-preferences';

describe('KoppelPreferences', () => {
  let component: KoppelPreferences;
  let fixture: ComponentFixture<KoppelPreferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KoppelPreferences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KoppelPreferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
