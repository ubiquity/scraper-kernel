import { assert } from "console";

describe("Initial Jest Infra, Scraper Kernel", () => {
  const a: any = 2;
  const b: any = 1;
});

it("Should assert value", () => {
  const a: any = 2;
  const b: any = 3;
  expect(a < b);
});

it("Should return correct name", () => {
  let name: string = "pavlovcik";
  assert(name == "pavlovcik");
});
