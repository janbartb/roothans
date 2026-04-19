import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpelerDialog } from './speler-dialog';

describe('SpelerDialog', () => {
  let component: SpelerDialog;
  let fixture: ComponentFixture<SpelerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpelerDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpelerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
