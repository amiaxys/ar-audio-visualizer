import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationCardComponent } from './visualization-card.component';

describe('VisualizationCardComponent', () => {
  let component: VisualizationCardComponent;
  let fixture: ComponentFixture<VisualizationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizationCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
