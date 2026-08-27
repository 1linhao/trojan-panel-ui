const paths = Object.freeze({
  home: 'M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  nodes: 'M5 5h4v4H5zm10 0h4v4h-4zM10 15h4v4h-4zM9 7h6m-3 2v6'
})

export const iconNames = Object.freeze(Object.keys(paths))

export function renderIcon(h, name, attrs = {}) {
  if (!paths[name]) throw new TypeError(`Unknown icon: ${name}`)
  return h(
    'svg',
    {
      attrs: {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'aria-hidden': 'true',
        ...attrs
      }
    },
    [
      h('path', {
        attrs: {
          d: paths[name],
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }
      })
    ]
  )
}
