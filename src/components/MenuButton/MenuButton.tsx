import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import type { SAILAlign, SAILColorInput, SAILSize } from '../../types/sail'
import { ButtonWidget } from '../Button/ButtonWidget'

/**
 * MenuButton
 *
 * A button that opens a menu of choices. Composed rather than built: the visible buttons
 * are `ButtonWidget`s and the menu is Radix's DropdownMenu, so this component holds the
 * arrangement and nothing else — no styling of its own, and no second implementation of a
 * button to keep in step with the first.
 *
 * Two arrangements:
 * - `MENU` — the whole button opens the menu, with a caret after the label.
 * - `SPLIT` — the label runs the primary action and an attached caret opens the menu.
 *
 * Not a SAIL parameter. The choice list mirrors DropdownField (`choiceLabels` /
 * `choiceValues`) so the two read as one system.
 *
 * Radix supplies the behaviour a menu needs and is easy to get wrong by hand: the trigger
 * gets aria-haspopup and aria-expanded, and the menu gets roving focus, type-ahead,
 * Escape, outside-click dismissal and focus return.
 */

export type MenuButtonLayout = 'MENU' | 'SPLIT'

export interface MenuButtonProps {
  /** Text on the button */
  label?: string
  /** Lucide icon name, kebab-case */
  icon?: string
  /** Visual style, passed to the underlying button */
  style?: 'SOLID' | 'OUTLINE' | 'GHOST' | 'LINK'
  color?: SAILColorInput
  size?: SAILSize
  disabled?: boolean
  tooltip?: string
  accessibilityText?: string

  /** How the menu is opened. Defaults to the whole button. */
  layout?: MenuButtonLayout
  /** Menu options for the user to select (same parameter as DropdownField) */
  choiceLabels: string[]
  /** Values passed to the callback; falls back to the label at the same index */
  choiceValues?: unknown[]
  /** Lucide icon name per choice, kebab-case */
  choiceIcons?: string[]
  /** Supporting line under each choice */
  choiceDescriptions?: string[]
  /** Choices that cannot be picked */
  choiceDisabled?: boolean[]
  /** Heading above the choices */
  menuLabel?: string
  /** Which edge of the button the menu aligns to */
  menuAlign?: SAILAlign
  /** Names the caret for assistive tech in the SPLIT arrangement */
  menuAccessibilityText?: string

  /** Called with the chosen value */
  saveInto?: (value: unknown) => void
  /** SPLIT only — the primary action, run by the label */
  onClick?: () => void
  /** Determines whether the component is displayed */
  showWhen?: boolean
  className?: string
}

/** Resolves a kebab-case lucide name to its component, or null when unknown. */
function iconComponent(name?: string) {
  if (!name) return null
  const pascal = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  return (
    (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[
      pascal
    ] ?? null
  )
}

const CARET_SIZE: Record<SAILSize, number> = {
  SMALL: 14,
  STANDARD: 16,
  MEDIUM: 18,
  LARGE: 20,
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  icon,
  style = 'SOLID',
  color,
  size = 'STANDARD',
  disabled = false,
  tooltip,
  accessibilityText,
  layout = 'MENU',
  choiceLabels,
  choiceValues = [],
  choiceIcons = [],
  choiceDescriptions = [],
  choiceDisabled = [],
  menuLabel,
  menuAlign = 'START',
  menuAccessibilityText,
  saveInto,
  onClick,
  showWhen = true,
  className,
}) => {
  if (!showWhen || choiceLabels.length === 0) return null

  const choose = (index: number) => {
    const chosen = choiceValues.length > index ? choiceValues[index] : choiceLabels[index]
    saveInto?.(chosen)
  }

  const menu = (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={menuAlign === 'END' ? 'end' : menuAlign === 'CENTER' ? 'center' : 'start'}
        sideOffset={4}
        /* Panel styling matches DropdownField's option list so the two read as one system */
        className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-hidden rounded-sm border border-gray-300 bg-white shadow-lg"
      >
        <div className="max-h-48 overflow-y-auto">
          {menuLabel && (
            <DropdownMenu.Label className="px-3 py-2 text-sm text-gray-700">
              {menuLabel}
            </DropdownMenu.Label>
          )}
          {choiceLabels.map((choiceLabel, index) => {
            const ChoiceIcon = iconComponent(choiceIcons[index])
            return (
              <DropdownMenu.Item
                key={`${choiceLabel}-${index}`}
                disabled={choiceDisabled[index] === true}
                onSelect={() => choose(index)}
                className="flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left text-base outline-none hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
              >
                {ChoiceIcon && (
                  <span className="mt-0.5 shrink-0 text-gray-700">
                    <ChoiceIcon size={16} aria-hidden="true" />
                  </span>
                )}
                <span className="flex-1">
                  <span className="block">{choiceLabel}</span>
                  {choiceDescriptions[index] && (
                    <span className="block text-sm text-gray-700">
                      {choiceDescriptions[index]}
                    </span>
                  )}
                </span>
              </DropdownMenu.Item>
            )
          })}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  )

  if (layout === 'SPLIT') {
    return (
      /* The caret is its own button so the primary action stays one click away. The two are
         squared off where they meet, so they read as one control. */
      <span className="inline-flex items-stretch">
        <ButtonWidget
          label={label}
          icon={icon}
          style={style}
          color={color}
          size={size}
          disabled={disabled}
          tooltip={tooltip}
          accessibilityText={accessibilityText}
          onClick={onClick}
          className={['rounded-r-none', className].filter(Boolean).join(' ')}
        />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild disabled={disabled}>
            <ButtonWidget
              icon="chevron-down"
              style={style}
              color={color}
              size={size}
              disabled={disabled}
              accessibilityText={
                menuAccessibilityText ?? (label ? `More ${label} options` : 'More options')
              }
              className={['rounded-l-none -ml-px', className].filter(Boolean).join(' ')}
            />
          </DropdownMenu.Trigger>
          {menu}
        </DropdownMenu.Root>
      </span>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        {/* ButtonWidget forwards its ref and extra props, so Radix can own the element */}
        <ButtonWidget
          label={label}
          icon={icon}
          style={style}
          color={color}
          size={size}
          disabled={disabled}
          tooltip={tooltip}
          accessibilityText={accessibilityText}
          className={className}
        >
          <ChevronDown size={CARET_SIZE[size]} aria-hidden="true" />
        </ButtonWidget>
      </DropdownMenu.Trigger>
      {menu}
    </DropdownMenu.Root>
  )
}

MenuButton.displayName = 'MenuButton'
