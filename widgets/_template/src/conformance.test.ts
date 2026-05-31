import assert from "node:assert/strict";
import test from "node:test";
import { __EXT_CAMEL__Descriptor } from "./index.ts";

test("runWidgetConformance: __EXT_NAME__ descriptor shape", () => {
  assert.equal(__EXT_CAMEL__Descriptor.id, "__EXT_KEBAB__");
  assert.equal(__EXT_CAMEL__Descriptor.defaultSlot, "slot8");
});
