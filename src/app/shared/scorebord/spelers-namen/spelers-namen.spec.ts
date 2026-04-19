import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpelersNamen } from './spelers-namen';

describe('SpelersNamen', () => {
  let component: SpelersNamen;
  let fixture: ComponentFixture<SpelersNamen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpelersNamen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpelersNamen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
