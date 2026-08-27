const text = (value, fallback = "") => typeof value === "string" && value.trim() ? value.trim() : fallback;
function assertUnique(keys, label) {
  const seen = /* @__PURE__ */ new Set();
  for (const key of keys) {
    if (seen.has(key)) throw new TypeError(`Duplicate ${label} key: ${key}`);
    seen.add(key);
  }
}
function normalizeShellModel(input = {}) {
  var _a, _b, _c, _d;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("LiquidAppShell model must be an object");
  }
  const itemKeys = [];
  const groupKeys = [];
  const navGroups = (Array.isArray(input.navGroups) ? input.navGroups : []).map((group, groupIndex) => {
    const key = text(group == null ? void 0 : group.key, `group-${groupIndex}`);
    groupKeys.push(key);
    const items = (Array.isArray(group == null ? void 0 : group.items) ? group.items : []).map((item, itemIndex) => {
      const itemKey = text(item == null ? void 0 : item.key);
      if (!itemKey) throw new TypeError(`Navigation item at ${key}[${itemIndex}] requires a key`);
      const label = text(item == null ? void 0 : item.label);
      if (!label) throw new TypeError(`Navigation item ${itemKey} requires a label`);
      itemKeys.push(itemKey);
      return Object.freeze({
        key: itemKey,
        label,
        mobileLabel: text(item.mobileLabel, label),
        icon: text(item.icon),
        disabled: Boolean(item.disabled)
      });
    });
    return Object.freeze({ key, label: text(group == null ? void 0 : group.label), items: Object.freeze(items) });
  }).filter((group) => group.items.length);
  assertUnique(groupKeys, "navigation group");
  assertUnique(itemKeys, "navigation item");
  const availableKeys = new Set(itemKeys);
  const mobileKeys = (Array.isArray(input.mobileKeys) ? input.mobileKeys : itemKeys).filter((key, index, keys) => availableKeys.has(key) && keys.indexOf(key) === index);
  const activeKey = availableKeys.has(input.activeKey) ? input.activeKey : itemKeys[0];
  const brand = Object.freeze({
    name: text((_a = input.brand) == null ? void 0 : _a.name, "Application"),
    mark: text((_b = input.brand) == null ? void 0 : _b.mark, text((_c = input.brand) == null ? void 0 : _c.name, "A").slice(0, 1).toUpperCase()),
    subtitle: text((_d = input.brand) == null ? void 0 : _d.subtitle)
  });
  const user = input.user ? Object.freeze({
    name: text(input.user.name, "User"),
    initials: text(input.user.initials, text(input.user.name, "U").slice(0, 2).toUpperCase())
  }) : null;
  return Object.freeze({
    brand,
    title: text(input.title, brand.name),
    activeKey,
    navGroups: Object.freeze(navGroups),
    mobileKeys: Object.freeze(mobileKeys),
    user,
    busy: Boolean(input.busy)
  });
}
function flattenNavigation(model) {
  return model.navGroups.flatMap((group) => group.items);
}
export {
  flattenNavigation,
  normalizeShellModel
};
