function iconSlot(component, h, item) {
  return component.$scopedSlots.icon
    ? component.$scopedSlots.icon({ name: item.icon, item })
    : []
}

function navButton(component, h, item, mobile = false) {
  return h(
    'button',
    {
      key: `${mobile ? 'mobile' : 'desktop'}:${item.key}`,
      class: [
        'tp-ui-shell__nav-item',
        { 'is-active': component.model.activeKey === item.key }
      ],
      attrs: {
        type: 'button',
        disabled: item.disabled,
        'data-ui-state':
          component.model.activeKey === item.key ? 'selected' : 'idle'
      },
      on: { click: () => component.$emit('navigate', item.key, item) }
    },
    [
      ...iconSlot(component, h, item),
      h('span', mobile ? item.mobileLabel : item.label)
    ]
  )
}

export const UiAppShell = {
  name: 'UiAppShell',
  props: { model: { type: Object, required: true } },
  render(h) {
    const allItems = this.model.groups.flatMap((group) => group.items)
    return h(
      'div',
      {
        class: 'tp-ui-shell',
        attrs: { 'data-ui-surface': 'canvas', 'data-ui-density': 'comfortable' }
      },
      [
        h(
          'aside',
          {
            class: 'tp-ui-shell__side',
            attrs: {
              'data-ui-surface': 'navigation',
              'data-ui-tone': 'neutral'
            }
          },
          [
            h(
              'button',
              {
                class: 'tp-ui-shell__brand',
                attrs: { type: 'button' },
                on: { click: () => this.$emit('action', 'brand') }
              },
              [
                h(
                  'span',
                  { class: 'tp-ui-shell__brand-mark' },
                  this.model.brand.mark
                ),
                h('span', [
                  h('strong', this.model.brand.name),
                  h('small', this.model.brand.subtitle)
                ])
              ]
            ),
            ...this.model.groups.flatMap((group) => [
              h(
                'div',
                { key: `${group.key}:label`, class: 'tp-ui-shell__nav-label' },
                group.label
              ),
              ...group.items.map((item) => navButton(this, h, item))
            ])
          ]
        ),
        h('main', { class: 'tp-ui-shell__main' }, [
          h(
            'header',
            {
              class: 'tp-ui-shell__topbar',
              attrs: { 'data-ui-surface': 'raised', 'data-ui-tone': 'neutral' }
            },
            [
              h('h1', this.model.pageTitle),
              h('div', { class: 'tp-ui-shell__actions' }, [
                ...(this.$slots.actions || []),
                this.model.user
                  ? h(
                      'button',
                      {
                        class: 'tp-ui-shell__user',
                        attrs: { type: 'button' },
                        on: { click: () => this.$emit('logout') }
                      },
                      this.model.user.label || this.model.user.name || ''
                    )
                  : null
              ])
            ]
          ),
          h('section', { class: 'tp-ui-shell__content' }, this.$slots.default)
        ]),
        h(
          'nav',
          {
            class: 'tp-ui-shell__mobile-nav',
            attrs: {
              'data-ui-surface': 'navigation',
              'aria-label': 'Application navigation'
            }
          },
          allItems.map((item) => navButton(this, h, item, true))
        )
      ]
    )
  }
}

export function createAppShell() {
  return Object.freeze({
    install(Vue) {
      Vue.component('UiAppShell', UiAppShell)
    }
  })
}
