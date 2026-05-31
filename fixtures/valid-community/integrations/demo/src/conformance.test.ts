import { demoDescriptor } from ".";

test("runIntegrationConformance fixture", () => {
  expect(demoDescriptor.id).toBe("demo");
});
