import { demoDescriptor } from ".";

test("runPluginConformance fixture", () => {
  expect(demoDescriptor.id).toBe("demo");
});
