import type { WidgetTemplateConfig } from "@radarboard/widget-engine/templates";
import { TemplateWidgetCompact } from "@radarboard/widget-engine/templates";
import type { WidgetRenderProps } from "@radarboard/widget-sdk/widget-types";

export function __EXT_PASCAL__Compact(props: WidgetRenderProps<WidgetTemplateConfig>) {
  return <TemplateWidgetCompact {...props} />;
}
