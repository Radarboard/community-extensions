import type { WidgetTemplateConfig } from "@radarboard/widget-engine/templates";
import { TemplateWidgetExpanded } from "@radarboard/widget-engine/templates";
import type { WidgetRenderProps } from "@radarboard/widget-sdk/widget-types";

export function __EXT_PASCAL__Expanded(props: WidgetRenderProps<WidgetTemplateConfig>) {
  return <TemplateWidgetExpanded {...props} />;
}
