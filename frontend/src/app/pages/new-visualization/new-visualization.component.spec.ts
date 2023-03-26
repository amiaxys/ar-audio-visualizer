import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVisualizationComponent } from './new-visualization.component';

describe('NewVisualizationComponent', () => {
  let component: NewVisualizationComponent;
  let fixture: ComponentFixture<NewVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewVisualizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
