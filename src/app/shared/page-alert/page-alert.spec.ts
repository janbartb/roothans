import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAlert } from './page-alert';

describe('PageAlert', () => {
  let component: PageAlert;
  let fixture: ComponentFixture<PageAlert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAlert]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAlert);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
