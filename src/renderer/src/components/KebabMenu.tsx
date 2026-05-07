import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid'

export interface KebabMenuItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  destructive?: boolean
}

interface KebabMenuProps {
  items: KebabMenuItem[]
}

export function KebabMenu({ items }: KebabMenuProps): React.JSX.Element {
  return (
    <Menu>
      <MenuButton
        title="More"
        aria-label="More actions"
        className="rounded p-0.5 text-text-muted opacity-40 transition-opacity hover:bg-elevated hover:text-text data-open:bg-elevated data-open:text-text data-open:opacity-100"
      >
        <EllipsisHorizontalIcon className="size-4" />
      </MenuButton>
      <MenuItems
        transition
        anchor="bottom end"
        className="z-20 w-40 origin-top-right rounded-xl border border-border bg-elevated p-1 text-[13px] text-text shadow-xl transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <MenuItem key={item.label}>
              <button
                onClick={item.onClick}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left ${
                  item.destructive
                    ? 'data-focus:bg-border-strong data-focus:text-red-400'
                    : 'data-focus:bg-border-strong'
                }`}
              >
                {Icon && <Icon className="size-4 text-text-muted" />}
                {item.label}
              </button>
            </MenuItem>
          )
        })}
      </MenuItems>
    </Menu>
  )
}
