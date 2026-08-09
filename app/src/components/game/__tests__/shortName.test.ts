import { shortName } from "../shortName";

describe("shortName", () => {
  it("returns the full string when it fits", () => {
    expect(shortName("You", 12)).toBe("You");
    expect(shortName("Drake", 14)).toBe("Drake");
  });

  it("truncates with an ellipsis when longer than max", () => {
    expect(shortName("Captain Drake", 10)).toBe("Captain D…");
    expect(shortName("AB", 1)).toBe("A…");
  });
});
