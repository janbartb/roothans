import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitSpelers } from './init-spelers';

describe('InitSpelers', () => {
  let component: InitSpelers;
  let fixture: ComponentFixture<InitSpelers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitSpelers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitSpelers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
