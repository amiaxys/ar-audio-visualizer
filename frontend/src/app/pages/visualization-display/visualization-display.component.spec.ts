import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationDisplayComponent } from './visualization-display.component';

describe('VisualizationDisplayComponent', () => {
  let component: VisualizationDisplayComponent;
  let fixture: ComponentFixture<VisualizationDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisualizationDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizationDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
