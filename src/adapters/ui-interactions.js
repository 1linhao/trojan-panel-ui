import { createButtonInteractionController } from '@tp-ui/components-vue2'
import {
  createMotionEnvironment,
  createNativeMotion
} from '@tp-ui/motion-native'

let releaseRuntime = null

/**
 * Production composition Adapter. Product components know only the stable
 * data-ui-interaction Interface; animation engines are selected here.
 */
export function installUiInteractions({ root = document } = {}) {
  releaseRuntime?.()

  const motion = createNativeMotion({ root: root.documentElement })
  const environment = createMotionEnvironment(root.defaultView || globalThis)
  const applySystemMotion = (reduced) =>
    motion.apply({
      mode: 'system',
      resolvedMode: reduced ? 'reduced' : 'full'
    })

  applySystemMotion(environment.getReducedMotion())
  const unsubscribeMotion = environment.subscribeReducedMotion(
    applySystemMotion
  )
  const buttons = createButtonInteractionController({ root }).mount()

  releaseRuntime = () => {
    unsubscribeMotion()
    buttons.destroy()
    releaseRuntime = null
  }
  return releaseRuntime
}
