import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ButtonWidget } from './ButtonWidget'
import { ButtonArrayLayout } from './ButtonArrayLayout'

const meta = {
  title: 'Components/Button',
  component: ButtonWidget,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    style: { control: 'select', options: ['SOLID', 'OUTLINE', 'GHOST', 'LINK'] },
    color: { control: 'text' },
    size: { control: 'select', options: ['SMALL', 'STANDARD', 'MEDIUM', 'LARGE'] },
    menuLayout: { control: 'inline-radio', options: ['NONE', 'MENU', 'SPLIT'] },
    menuAlign: { control: 'inline-radio', options: ['START', 'CENTER', 'END'] },
  },
} satisfies Meta<typeof ButtonWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Submit',
    style: 'SOLID',
    color: 'ACCENT',
    size: 'STANDARD',
    saveInto: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Submit' })
    await expect(button).toBeVisible()
    await userEvent.click(button)
    await expect(args.saveInto).toHaveBeenCalledOnce()
  },
}

export const SemanticColorsSolid: Story = {
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: 'ACCENT', style: 'SOLID', color: 'ACCENT' },
        { label: 'POSITIVE', style: 'SOLID', color: 'POSITIVE' },
        { label: 'NEGATIVE', style: 'SOLID', color: 'NEGATIVE' },
        { label: 'SECONDARY', style: 'SOLID', color: 'SECONDARY' },
        { label: 'STANDARD', style: 'SOLID', color: 'STANDARD' },
      ]}
    />
  ),
}

export const SemanticColorsOutline: Story = {
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: 'ACCENT', style: 'OUTLINE', color: 'ACCENT' },
        { label: 'POSITIVE', style: 'OUTLINE', color: 'POSITIVE' },
        { label: 'NEGATIVE', style: 'OUTLINE', color: 'NEGATIVE' },
        { label: 'SECONDARY', style: 'OUTLINE', color: 'SECONDARY' },
        { label: 'STANDARD', style: 'OUTLINE', color: 'STANDARD' },
      ]}
    />
  ),
}

export const ButtonStyles: Story = {
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: 'SOLID', style: 'SOLID', color: 'ACCENT', size: 'STANDARD' },
        { label: 'OUTLINE', style: 'OUTLINE', color: 'ACCENT', size: 'STANDARD' },
        { label: 'GHOST', style: 'GHOST', color: 'ACCENT', size: 'STANDARD' },
        { label: 'LINK', style: 'LINK', color: 'ACCENT', size: 'STANDARD' },
      ]}
    />
  ),
}

export const ButtonSizes: Story = {
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: 'Small', style: 'SOLID', color: 'ACCENT', size: 'SMALL' },
        { label: 'Standard', style: 'SOLID', color: 'ACCENT', size: 'STANDARD' },
        { label: 'Medium', style: 'SOLID', color: 'ACCENT', size: 'MEDIUM' },
        { label: 'Large', style: 'SOLID', color: 'ACCENT', size: 'LARGE' },
      ]}
    />
  ),
}

export const HexColorsSolid: Story = {
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: 'Custom Violet', style: 'SOLID', color: 'VIOLET_300' },
        { label: 'Custom Orange', style: 'SOLID', color: 'ORANGE_300' },
        { label: 'Custom Pink', style: 'SOLID', color: 'PINK_300' },
      ]}
    />
  ),
}

export const HexColorsOutline: Story = {
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: 'Custom Violet', style: 'OUTLINE', color: 'VIOLET_700' },
        { label: 'Custom Orange', style: 'OUTLINE', color: 'ORANGE_700' },
        { label: 'Custom Pink', style: 'OUTLINE', color: 'PINK_700' },
      ]}
    />
  ),
}

export const WithActions: Story = {
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: 'Add Another', style: 'OUTLINE', color: 'ACCENT', icon: 'plus', tooltip: 'And another one', saveInto: () => alert('Add Another clicked') },
        { label: 'Delete', style: 'SOLID', color: 'NEGATIVE', saveInto: () => alert('Delete clicked') },
      ]}
    />
  ),
}

export const LinkStyle: Story = {
  args: {
    label: 'Cancel',
    style: 'LINK',
    color: 'ACCENT',
  },
}

export const MixedButtonTypes: Story = {
  name: 'Icon Buttons',
  render: () => (
    <ButtonArrayLayout
      buttons={[
        { label: '', icon: 'send', style: 'SOLID', color: 'ACCENT', size: 'MEDIUM' },
        { label: 'Send', icon: 'send', style: 'SOLID', color: 'ACCENT', size: 'MEDIUM' },
        { label: 'Send', style: 'SOLID', color: 'ACCENT', size: 'MEDIUM' },
      ]}
    />
  ),
}

/* ── Menu layouts ─────────────────────────────────────────────────────────── */

const createModelChoices = {
  choiceLabels: ['Blank model', 'From a template', 'From an existing model', 'Import model'],
  choiceValues: ['blank', 'template', 'duplicate', 'import'],
  choiceIcons: ['file', 'layout-template', 'copy', 'upload'],
  choiceDescriptions: [
    'Start from scratch and add document types yourself',
    'Pick a starting point for a common document set',
    'Copy an existing model and adjust it',
    'Bring in a model exported from another environment',
  ],
}

/**
 * `menuLayout="MENU"` — the whole button opens a menu of choices.
 *
 * The trigger matches the Doc Center "Create model" button: solid accent, `SMALL` size
 * (`px-3 py-2 text-sm`), with a leading `plus` icon. The choice parameters mirror
 * `DropdownField` — `choiceLabels`, `choiceValues`, `saveInto` — with `choiceIcons` and
 * `choiceDescriptions` as Sailwind additions.
 */
export const MenuLayout: Story = {
  args: {
    label: 'Create model',
    icon: 'plus',
    style: 'SOLID',
    color: 'ACCENT',
    size: 'SMALL',
    menuLayout: 'MENU',
    menuLabel: 'Create model',
    ...createModelChoices,
    menuSaveInto: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /create model/i });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    const body = within(document.body);
    const menu = body.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(body.getAllByRole('menuitem')).toHaveLength(4);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(body.getByRole('menuitem', { name: /from a template/i }));
    await expect(args.menuSaveInto).toHaveBeenCalledWith('template');
  },
};

/** The menu is fully keyboard operable: Enter opens it, arrows move, Escape closes. */
export const MenuKeyboard: Story = {
  args: {
    label: 'Create model',
    icon: 'plus',
    style: 'SOLID',
    color: 'ACCENT',
    size: 'SMALL',
    menuLayout: 'MENU',
    ...createModelChoices,
    menuSaveInto: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /create model/i });
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const body = within(document.body);
    await expect(body.getByRole('menu')).toBeVisible();
    // Opening with Enter lands on the first choice, so one ArrowDown is the second
    await expect(body.getByRole('menuitem', { name: /blank model/i })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.menuSaveInto).toHaveBeenCalledWith('template');
  },
};

/**
 * `menuLayout="SPLIT"` — the label runs the primary action and the attached caret opens
 * the menu, so the common case stays one click away.
 */
export const SplitMenuLayout: Story = {
  args: {
    label: 'Create model',
    icon: 'plus',
    style: 'SOLID',
    color: 'ACCENT',
    size: 'SMALL',
    menuLayout: 'SPLIT',
    menuAlign: 'END',
    ...createModelChoices,
    saveInto: fn(),
    menuSaveInto: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Create model' }));
    await expect(args.saveInto).toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: /more create model options/i }));
    const body = within(document.body);
    await expect(body.getByRole('menu')).toBeVisible();
    await userEvent.click(body.getByRole('menuitem', { name: /import model/i }));
    await expect(args.menuSaveInto).toHaveBeenCalledWith('import');
  },
};

/** Menu layouts work with any style, color, and size the button already supports. */
export const MenuLayoutVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <ButtonWidget
        label="Create model"
        icon="plus"
        style="SOLID"
        color="ACCENT"
        size="SMALL"
        menuLayout="MENU"
        {...createModelChoices}
      />
      <ButtonWidget
        label="Actions"
        style="OUTLINE"
        color="SECONDARY"
        size="STANDARD"
        menuLayout="MENU"
        choiceLabels={['Duplicate', 'Export', 'Delete']}
        choiceValues={['duplicate', 'export', 'delete']}
        choiceIcons={['copy', 'download', 'trash-2']}
        choiceDisabled={[false, false, true]}
      />
      <ButtonWidget
        label="Publish"
        style="SOLID"
        color="POSITIVE"
        size="STANDARD"
        menuLayout="SPLIT"
        choiceLabels={['Publish now', 'Schedule…']}
        choiceValues={['now', 'schedule']}
      />
    </div>
  ),
};
