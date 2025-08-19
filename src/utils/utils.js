export const getStandings = (rosters) => {
  rosters.sort((curr, next) => {
    // sort by wins first
    if (curr.wins < next.wins) {
      return 1;
    } else if (curr.wins > next.wins) {
      return -1;
    }

    // subsort by points for
    if (curr.PF > next.PF) {
      return -1;
    } else if (curr.PF < next.PF) {
      return 1;
    } else {
      return 0;
    }
  });
  rosters.forEach((roster, i) => {
    roster.user = `${i + 1}) ${roster.user}`;
    roster.standing = i + 1;
  });
  return rosters;
};

export const getLongestStreak = (winlosses, matchString) => {
  const regex = new RegExp(`(?:${matchString})+`, "g");
  const matches = winlosses.match(regex);
  const longestStreak = matches.reduce((longest, next) => {
    return longest.length > next.length ? longest : next;
  }, "");
  return longestStreak.length;
};

export const compileWeeklySeeds = (owners, allMatchupsInYear) => {
  const clonedOwners = [...owners];

  // Map through owners once to create owner lookup
  const ownerMap = new Map();
  clonedOwners.forEach((owner) => {
    ownerMap.set(owner.rosterId, owner);
  });

  allMatchupsInYear.forEach((matchupWeek, weekIndex) => {
    const matchupMap = {};

    // Group matchups by matchup_id
    matchupWeek.forEach((team) => {
      const id = team.matchup_id;
      if (!matchupMap[id]) matchupMap[id] = [];
      matchupMap[id].push(team);
    });

    // Compare each matchup pair
    Object.values(matchupMap).forEach((pair) => {
      if (pair.length === 2) {
        const [teamA, teamB] = pair;

        const ownerA = ownerMap.get(teamA.roster_id);
        const ownerB = ownerMap.get(teamB.roster_id);

        if (!ownerA || !ownerB) return;

        ownerA.pointsCount += teamA.points;
        ownerB.pointsCount += teamB.points;

        if (teamA.points > teamB.points) {
          ownerA.winCount += 1;
        } else if (teamB.points > teamA.points) {
          ownerB.winCount += 1;
        }
      }
    });

    // Rank all owners by winCount, then pointsCount
    const rankings = [...clonedOwners].sort((a, b) => {
      if (b.winCount === a.winCount) {
        return b.pointsCount - a.pointsCount;
      }
      return b.winCount - a.winCount;
    });

    // Store weekly seeds
    rankings.forEach((owner, i) => {
      owner.seeds[weekIndex] = i + 1;
    });
  });

  console.log("Compiled Owners with Weekly Seeds:", clonedOwners);
  return clonedOwners;
};
