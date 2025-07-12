// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function generateTitle(title) {
  // 优先查 aiOptimization
  if (this.$te && this.$te('aiOptimization.' + title)) {
    return this.$t('aiOptimization.' + title)
  }
  // 再查 route
  if (this.$te && this.$te('route.' + title)) {
    return this.$t('route.' + title)
  }
  return title
}
