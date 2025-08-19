import { compileWeeklySeeds } from "./utils";

describe("compileWeeklySeeds", () => {
  it("should compile weekly seeds correctly", () => {
    const owners = [
      { rosterId: 1, winCount: 0, pointsCount: 0, seeds: [] },
      { rosterId: 2, winCount: 0, pointsCount: 0, seeds: [] },
    ];

    const allMatchupsInYear = [
      [
        // Week 1
        { roster_id: 1, points: 100, matchup_id: 1 },
        { roster_id: 2, points: 99, matchup_id: 1 },
      ],
      [
        // Week 2
        { roster_id: 1, points: 95, matchup_id: 1 },
        { roster_id: 2, points: 105, matchup_id: 1 },
      ],
    ];
    const result = compileWeeklySeeds(owners, allMatchupsInYear);

    expect(result[0].seeds).toEqual([1, 2]);

    expect(result[1].seeds).toEqual([2, 1]);

    expect(result[0].winCount).toBe(1);
    expect(result[1].winCount).toBe(1);
  });
});
