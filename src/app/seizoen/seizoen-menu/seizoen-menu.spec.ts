import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeizoenMenu } from './seizoen-menu';

describe('SeizoenMenu', () => {
  let component: SeizoenMenu;
  let fixture: ComponentFixture<SeizoenMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeizoenMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeizoenMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
