import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PouleSchema } from './poule-schema';

describe('PouleSchema', () => {
  let component: PouleSchema;
  let fixture: ComponentFixture<PouleSchema>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PouleSchema]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PouleSchema);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
