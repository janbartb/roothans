import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KoppelsToevoegen } from './koppels-toevoegen';

describe('KoppelsToevoegen', () => {
  let component: KoppelsToevoegen;
  let fixture: ComponentFixture<KoppelsToevoegen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KoppelsToevoegen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KoppelsToevoegen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
