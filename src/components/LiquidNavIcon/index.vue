<template>
  <svg
    class="liquid-nav-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.35"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'dashboard'">
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.8" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.8" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.8" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1.8" />
    </template>

    <template v-else-if="name === 'account'">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.7-4 3.2-6 7.5-6s6.8 2 7.5 6" />
    </template>

    <template v-else-if="name === 'node'">
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="m7 6.5 3 3M14 10l3.2-3.3M14.2 14.1l3.1 3.1" />
    </template>

    <template v-else-if="name === 'server'">
      <rect x="3.5" y="3.5" width="17" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="17" height="7" rx="2" />
      <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
    </template>

    <template v-else-if="name === 'sysinfo'">
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 1.8v3.1M15 1.8v3.1M9 19.1v3.1M15 19.1v3.1M1.8 9h3.1M19.1 9h3.1M1.8 15h3.1M19.1 15h3.1M9 9h6v6H9z" />
    </template>

    <template v-else-if="name === 'task'">
      <path d="M7 3.5h10a2 2 0 0 1 2 2v15H5v-15a2 2 0 0 1 2-2Z" />
      <path d="M9 3.5v3h6v-3M8.5 11h7M8.5 15h5" />
    </template>

    <template v-else-if="name === 'email'">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m5 7 7 6 7-6" />
    </template>

    <template v-else-if="name === 'pass'">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.8 8.8 6.4 6.4" />
    </template>

    <template v-else-if="name === 'system'">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </template>

    <template v-else>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9" r="2.7" />
      <path d="M7.5 18c.7-2.7 2.2-4 4.5-4s3.8 1.3 4.5 4" />
    </template>
  </svg>
</template>

<script>
export default {
  name: 'LiquidNavIcon',
  props: {
    name: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.liquid-nav-icon {
  display: block;
  overflow: visible;
}
</style>
