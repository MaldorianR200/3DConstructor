import { Meta, StoryObj } from '@storybook/angular';
import { AdminInputComponent } from './admin-input.component';
import { FormControl } from '@angular/forms';

export default {
  title: 'AdminInput',
  component: AdminInputComponent,
} as Meta;

type Story = StoryObj<AdminInputComponent>;

export const Default: Story = (args: any) => ({
  component: AdminInputComponent,
  props: args,
});
export const SelectInput: Story = (args: any) => ({
  component: AdminInputComponent,
  props: args,
});

Default.args = {
  control: new FormControl(),
  props: {
    placeholder: 'Enter text...',
    required: true,
    minLength: 3,
    id: '',
  },
};
SelectInput.args = {
  control: new FormControl(),
  props: {
    placeholder: 'Выберите опцию...',
    type: 'select',
    required: true,
    options: ['Опция 1', 'Опция 2', 'Опция 3'],
    id: '',
  },
};
