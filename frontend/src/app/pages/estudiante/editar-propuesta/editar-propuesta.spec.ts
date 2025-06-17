import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPropuesta } from './editar-propuesta';

describe('EditarPropuesta', () => {
  let component: EditarPropuesta;
  let fixture: ComponentFixture<EditarPropuesta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPropuesta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPropuesta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
