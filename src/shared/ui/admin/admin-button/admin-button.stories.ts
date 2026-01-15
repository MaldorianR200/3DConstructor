import { Meta, StoryObj } from '@storybook/angular';
import { AdminButtonComponent } from './admin-button.component';

export default {
  title: 'AdminButton',
  component: AdminButtonComponent,
} as Meta;

type Story = StoryObj<AdminButtonComponent>;

export const Default: Story = (args: any) => ({
  component: AdminButtonComponent,
  props: args,
});
Default.args = {};
