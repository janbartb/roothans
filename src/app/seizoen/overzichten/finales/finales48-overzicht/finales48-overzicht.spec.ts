import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Finales48Overzicht } from './finales48-overzicht';

describe('Finales48Overzicht', () => {
  let component: Finales48Overzicht;
  let fixture: ComponentFixture<Finales48Overzicht>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Finales48Overzicht]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Finales48Overzicht);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
