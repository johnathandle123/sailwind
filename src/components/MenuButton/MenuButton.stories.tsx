import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { MenuButton } from './MenuButton'

/**
 * A button that opens a menu of choices, composed from ButtonWidget and Radix's
 * DropdownMenu. Kept out of ButtonWidget so the button API stays the shape of a button.
 */
const meta = {
  title: 'Components/MenuButton',
  component: MenuButton,
  parameters: { layout: 'centered' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['MENU', 'SPLIT'] },
    menuAlign: { control: 'inline-radio', options: ['START', 'CENTER', 'END'] },
    style: { control: 'inline-radio', options: ['SOLID', 'OUTLINE', 'GHOST', 'LINK'] },
    size: { control: 'inline-radio', options: ['SMALL', 'STANDARD', 'MEDIUM', 'LARGE'] },
  },
} satisfies Meta<typeof MenuButton>

export default meta
type Story = StoryObj<typeof meta>

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
 * `layout="MENU"` — the whole button opens a menu of choices.
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
    layout: 'MENU',
    menuLabel: 'Create model',
    ...createModelChoices,
    saveInto: fn(),
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
    await expect(args.saveInto).toHaveBeenCalledWith('template');
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
    layout: 'MENU',
    ...createModelChoices,
    saveInto: fn(),
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
    await expect(args.saveInto).toHaveBeenCalledWith('template');
  },
};

/**
 * `layout="SPLIT"` — the label runs the primary action and the attached caret opens
 * the menu, so the common case stays one click away.
 */
export const SplitMenuLayout: Story = {
  args: {
    label: 'Create model',
    icon: 'plus',
    style: 'SOLID',
    color: 'ACCENT',
    size: 'SMALL',
    layout: 'SPLIT',
    menuAlign: 'END',
    ...createModelChoices,
    onClick: fn(),
    saveInto: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // The label runs the primary action; the caret is what opens the menu
    await userEvent.click(canvas.getByRole('button', { name: 'Create model' }));
    await expect(args.onClick).toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: /more create model options/i }));
    const body = within(document.body);
    await expect(body.getByRole('menu')).toBeVisible();
    await userEvent.click(body.getByRole('menuitem', { name: /import model/i }));
    await expect(args.saveInto).toHaveBeenCalledWith('import');
  },
};

/** Menu layouts work with any style, color, and size the button already supports. */
export const MenuLayoutVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <MenuButton
        label="Create model"
        icon="plus"
        style="SOLID"
        color="ACCENT"
        size="SMALL"
        layout="MENU"
        {...createModelChoices}
      />
      <MenuButton
        label="Actions"
        style="OUTLINE"
        color="SECONDARY"
        size="STANDARD"
        layout="MENU"
        choiceLabels={['Duplicate', 'Export', 'Delete']}
        choiceValues={['duplicate', 'export', 'delete']}
        choiceIcons={['copy', 'download', 'trash-2']}
        choiceDisabled={[false, false, true]}
      />
      <MenuButton
        label="Publish"
        style="SOLID"
        color="POSITIVE"
        size="STANDARD"
        layout="SPLIT"
        choiceLabels={['Publish now', 'Schedule…']}
        choiceValues={['now', 'schedule']}
      />
    </div>
  ),
};
