import assert from "node:assert/strict";
import test from "node:test";
import { __EXT_CAMEL__Descriptor } from "./index.ts";

test("runPluginConformance: __EXT_NAME__ descriptor shape", () => {
  assert.equal(__EXT_CAMEL__Descriptor.id, "__EXT_KEBAB__");
  assert.equal(__EXT_CAMEL__Descriptor.version, "0.1.0");
});
