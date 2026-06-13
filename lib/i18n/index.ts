import type { Locale } from "@/lib/types";

export type TranslationKey =
  | "app.title"
  | "nav.meals"
  | "nav.dishes"
  | "nav.inventory"
  | "nav.settings"
  | "meals.tomorrow"
  | "meals.history"
  | "meals.noPlan"
  | "meals.generate"
  | "meals.confirm"
  | "meals.edit"
  | "meals.addDish"
  | "meals.swapDish"
  | "meals.removeDish"
  | "meals.draft"
  | "meals.confirmed"
  | "meals.breakfast"
  | "meals.lunch"
  | "meals.dinner"
  | "meals.dishName"
  | "meals.dishTags"
  | "meals.save"
  | "meals.cancel"
  | "meals.emptyHistory"
  | "meals.similarDishFound"
  | "meals.useExistingDish"
  | "meals.createAnyway"
  | "meals.fromHistory"
  | "meals.suggestions"
  | "meals.tapToAdd"
  | "meals.refreshRecommend"
  | "meals.refreshWarning"
  | "meals.refreshConfirm"
  | "dishes.subtitle"
  | "dishes.add"
  | "dishes.empty"
  | "dishes.mealTypes"
  | "inventory.title"
  | "inventory.add"
  | "inventory.name"
  | "inventory.category"
  | "inventory.quantity"
  | "inventory.unit"
  | "inventory.empty"
  | "inventory.photoScan"
  | "inventory.comingSoon"
  | "inventory.veg"
  | "inventory.meat"
  | "inventory.seafood"
  | "inventory.other"
  | "settings.title"
  | "settings.profile"
  | "settings.language"
  | "settings.timezone"
  | "settings.family"
  | "settings.addMember"
  | "settings.email"
  | "settings.role"
  | "settings.signOut"
  | "settings.admin"
  | "settings.editor"
  | "settings.viewer"
  | "settings.remove"
  | "settings.readOnly"
  | "tag.veg"
  | "tag.meat"
  | "tag.seafood"
  | "tag.soup"
  | "tag.starch"
  | "tag.other"
  | "auth.signIn"
  | "auth.signInWithGoogle"
  | "auth.notAllowed"
  | "auth.loading"
  | "common.save"
  | "common.cancel"
  | "common.delete"
  | "common.edit"
  | "common.loading"
  | "common.error";

const en: Record<TranslationKey, string> = {
  "app.title": "Meal Planner",
  "nav.meals": "Meals",
  "nav.dishes": "Dishes",
  "nav.inventory": "Inventory",
  "nav.settings": "Settings",
  "meals.tomorrow": "Tomorrow's Plan",
  "meals.history": "History",
  "meals.noPlan": "No plan for tomorrow yet",
  "meals.generate": "Generate recommendation",
  "meals.confirm": "Confirm plan",
  "meals.edit": "Edit plan",
  "meals.addDish": "Add dish",
  "meals.swapDish": "Swap dish",
  "meals.removeDish": "Remove",
  "meals.draft": "Draft",
  "meals.confirmed": "Confirmed",
  "meals.breakfast": "Breakfast",
  "meals.lunch": "Lunch",
  "meals.dinner": "Dinner",
  "meals.dishName": "Dish name",
  "meals.dishTags": "Tags",
  "meals.save": "Save",
  "meals.cancel": "Cancel",
  "meals.emptyHistory": "No past plans yet",
  "meals.similarDishFound": "Similar dish already exists",
  "meals.useExistingDish": "Use existing dish",
  "meals.createAnyway": "Create as new dish anyway",
  "meals.fromHistory": "History",
  "meals.suggestions": "Suggestions",
  "meals.tapToAdd": "Tap to add",
  "meals.refreshRecommend": "Refresh recommendation",
  "meals.refreshWarning":
    "This will replace the current plan with a new recommendation.",
  "meals.refreshConfirm": "Replace plan",
  "dishes.subtitle": "Your dish library — add dishes here anytime",
  "dishes.add": "Add dish",
  "dishes.empty": "No dishes in this category",
  "dishes.mealTypes": "For meals",
  "inventory.title": "Inventory",
  "inventory.add": "Add item",
  "inventory.name": "Name",
  "inventory.category": "Category",
  "inventory.quantity": "Qty",
  "inventory.unit": "Unit",
  "inventory.empty": "No items in this category",
  "inventory.photoScan": "Scan photo",
  "inventory.comingSoon": "Coming soon",
  "inventory.veg": "Vegetables",
  "inventory.meat": "Meat",
  "inventory.seafood": "Seafood",
  "inventory.other": "Other",
  "settings.title": "Settings",
  "settings.profile": "Profile",
  "settings.language": "Language",
  "settings.timezone": "Timezone",
  "settings.family": "Family members",
  "settings.addMember": "Add member",
  "settings.email": "Email",
  "settings.role": "Role",
  "settings.signOut": "Sign out",
  "settings.admin": "Admin",
  "settings.editor": "Editor",
  "settings.viewer": "Viewer",
  "settings.remove": "Remove",
  "settings.readOnly": "Read-only access",
  "tag.veg": "Vegetable",
  "tag.meat": "Meat",
  "tag.seafood": "Seafood",
  "tag.soup": "Soup",
  "tag.starch": "Starch",
  "tag.other": "Other",
  "auth.signIn": "Sign in",
  "auth.signInWithGoogle": "Sign in with Google",
  "auth.notAllowed": "Your email is not on the family allowlist",
  "auth.loading": "Loading...",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.loading": "Loading...",
  "common.error": "Something went wrong",
};

const zhCN: Record<TranslationKey, string> = {
  "app.title": "家庭餐单",
  "nav.meals": "餐单",
  "nav.dishes": "菜品",
  "nav.inventory": "库存",
  "nav.settings": "设置",
  "meals.tomorrow": "明日餐单",
  "meals.history": "历史记录",
  "meals.noPlan": "还没有安排明天的餐单",
  "meals.generate": "生成推荐",
  "meals.confirm": "确认餐单",
  "meals.edit": "编辑餐单",
  "meals.addDish": "添加菜品",
  "meals.swapDish": "更换菜品",
  "meals.removeDish": "删除",
  "meals.draft": "草稿",
  "meals.confirmed": "已确认",
  "meals.breakfast": "早餐",
  "meals.lunch": "午餐",
  "meals.dinner": "晚餐",
  "meals.dishName": "菜名",
  "meals.dishTags": "标签",
  "meals.save": "保存",
  "meals.cancel": "取消",
  "meals.emptyHistory": "暂无历史记录",
  "meals.similarDishFound": "已有相似菜品",
  "meals.useExistingDish": "使用已有菜品",
  "meals.createAnyway": "仍然创建新菜品",
  "meals.fromHistory": "历史菜品",
  "meals.suggestions": "推荐",
  "meals.tapToAdd": "点击添加",
  "meals.refreshRecommend": "重新推荐",
  "meals.refreshWarning": "这将用新的推荐替换当前餐单。",
  "meals.refreshConfirm": "确认替换",
  "dishes.subtitle": "菜品库 — 随时添加常做的菜",
  "dishes.add": "添加菜品",
  "dishes.empty": "该分类暂无菜品",
  "dishes.mealTypes": "适用于",
  "inventory.title": "库存",
  "inventory.add": "添加",
  "inventory.name": "名称",
  "inventory.category": "分类",
  "inventory.quantity": "数量",
  "inventory.unit": "单位",
  "inventory.empty": "该分类暂无物品",
  "inventory.photoScan": "拍照识别",
  "inventory.comingSoon": "即将推出",
  "inventory.veg": "蔬菜",
  "inventory.meat": "肉类",
  "inventory.seafood": "海鲜",
  "inventory.other": "其他",
  "settings.title": "设置",
  "settings.profile": "个人资料",
  "settings.language": "语言",
  "settings.timezone": "时区",
  "settings.family": "家庭成员",
  "settings.addMember": "添加成员",
  "settings.email": "邮箱",
  "settings.role": "角色",
  "settings.signOut": "退出登录",
  "settings.admin": "管理员",
  "settings.editor": "编辑者",
  "settings.viewer": "只读",
  "settings.remove": "移除",
  "settings.readOnly": "只读权限",
  "tag.veg": "蔬菜",
  "tag.meat": "肉类",
  "tag.seafood": "海鲜",
  "tag.soup": "汤",
  "tag.starch": "主食",
  "tag.other": "其他",
  "auth.signIn": "登录",
  "auth.signInWithGoogle": "使用 Google 登录",
  "auth.notAllowed": "您的邮箱不在家庭白名单中",
  "auth.loading": "加载中...",
  "common.save": "保存",
  "common.cancel": "取消",
  "common.delete": "删除",
  "common.edit": "编辑",
  "common.loading": "加载中...",
  "common.error": "出错了",
};

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  "zh-CN": zhCN,
};

export function t(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key] ?? key;
}

export function inventoryCategoryLabel(
  locale: Locale,
  category: string
): string {
  const map: Record<string, TranslationKey> = {
    veg: "inventory.veg",
    meat: "inventory.meat",
    seafood: "inventory.seafood",
    other: "inventory.other",
  };
  return t(locale, map[category] ?? "inventory.other");
}

export function mealSlotLabel(locale: Locale, slot: string): string {
  const map: Record<string, TranslationKey> = {
    breakfast: "meals.breakfast",
    lunch: "meals.lunch",
    dinner: "meals.dinner",
  };
  return t(locale, map[slot] ?? "meals.breakfast");
}

export function tagLabel(locale: Locale, tag: string): string {
  const map: Record<string, TranslationKey> = {
    veg: "tag.veg",
    meat: "tag.meat",
    seafood: "tag.seafood",
    soup: "tag.soup",
    starch: "tag.starch",
    other: "tag.other",
  };
  return t(locale, map[tag] ?? "tag.other");
}

export function roleLabel(locale: Locale, role: string): string {
  const map: Record<string, TranslationKey> = {
    admin: "settings.admin",
    editor: "settings.editor",
    viewer: "settings.viewer",
  };
  return t(locale, map[role] ?? "settings.viewer");
}

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "简体中文" },
];

export const TIMEZONES = [
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Taipei",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
];
