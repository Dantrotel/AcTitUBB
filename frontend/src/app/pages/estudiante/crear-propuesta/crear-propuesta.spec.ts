import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPropuesta } from './crear-propuesta';

describe('CrearPropuesta', () => {
  let component: CrearPropuesta;
  let fixture: ComponentFixture<CrearPropuesta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPropuesta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPropuesta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
