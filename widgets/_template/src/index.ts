import {
  buildTemplateRecipe,
  type TemplateRecipeModel,
  type WidgetTemplateConfig,
} from "@radarboard/widget-engine/templates";
import { kpiRow, list } from "@radarboard/widget-sdk/section-helpers";
import type { WidgetDescriptor } from "@radarboard/widget-sdk/widget-types";
import { __EXT_PASCAL__Compact } from "./components/__EXT_KEBAB__-compact";
import { __EXT_PASCAL__Expanded } from "./components/__EXT_KEBAB__-expanded";

const SRC = "__EXT_KEBAB__";

const recipe: TemplateRecipeModel = {
  kind: "summary_list",
  summary: [kpiRow(SRC, [{ label: "Total", field: "totalCount" }])],
  rail: [],
  content: [
    list(SRC, "items", {
      title: "title",
      subtitle: "subtitle",
      emptyMessage: "No items yet",
    }),
  ],
};

export const __EXT_UPPER___TEMPLATE_CONFIG: WidgetTemplateConfig = {
  dataSources: [{ id: SRC }],
  recipe,
  sections: buildTemplateRecipe(recipe),
  expandedRecipe: recipe,
  expandedSections: buildTemplateRecipe(recipe),
};

export const __EXT_CAMEL__Descriptor: WidgetDescriptor<WidgetTemplateConfig> = {
  id: "__EXT_KEBAB__",
  name: "__EXT_NAME__",
  description: "__EXT_NAME__ dashboard widget.",
  requiredIntegrations: [],
  capabilities: [
    {
      id: "uptime",
      role: "specialized",
      providers: [],
    },
  ],
  defaultSlot: "slot8",
  component: __EXT_PASCAL__Compact,
  expandedComponent: __EXT_PASCAL__Expanded,
  defaultConfig: __EXT_UPPER___TEMPLATE_CONFIG,
  visualEditor: {
    kind: "template",
    getConfig: ({ config }) => config,
    setConfig: ({ editorConfig }) => editorConfig as WidgetTemplateConfig,
  },
};
