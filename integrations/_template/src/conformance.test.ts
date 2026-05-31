import assert from "node:assert/strict";
import test from "node:test";
import { __EXT_CAMEL__Descriptor } from "./index.ts";

test("runIntegrationConformance: __EXT_NAME__ descriptor shape", () => {
  assert.equal(__EXT_CAMEL__Descriptor.id, "__EXT_KEBAB__");
  assert.equal(__EXT_CAMEL__Descriptor.name, "__EXT_NAME__");
  assert.ok(__EXT_CAMEL__Descriptor.dataSources.length > 0);
});
