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
  console.log(rosters);
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
