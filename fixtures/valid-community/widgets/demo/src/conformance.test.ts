import { demoDescriptor } from ".";

test("runWidgetConformance fixture", () => {
  expect(demoDescriptor.id).toBe("demo");
});
