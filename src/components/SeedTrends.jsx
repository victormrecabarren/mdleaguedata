import { useEffect, useState, useRef } from "react";
import { leagueEndpoint } from "../config";
import { matchupsEndpoint } from "../config";
import { compileWeeklySeeds } from "../utils/utils";

const SeedTrends = ({ owners }) => {
    const [updatedOwners, setUpdatedOwners] = useState([]);
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (!owners || owners.length === 0 || hasProcessed.current) {
            return;
        }

        let numOfRegularSeasonGames = 0;
        let allMatchups = [];

        const fetchMatchUpData = async () => {
            const leagueRes = await fetch(leagueEndpoint);
            const leagueData = await leagueRes.json();
            numOfRegularSeasonGames = leagueData.settings.last_report;

            for (let i = 1; i <= numOfRegularSeasonGames; i++) {
                const matchupRes = await fetch(`${matchupsEndpoint}/${i}`);
                const matchupData = await matchupRes.json();
                allMatchups.push(matchupData);
            };

            return allMatchups;
        };

        const compileSeeds = async () => {
            allMatchups = await fetchMatchUpData();
            
            const freshOwners = owners.map(owner => ({
                ...owner,
                winCount: 0,
                pointsCount: 0,
                seeds: []
            }));
            
            const processedOwners = compileWeeklySeeds(freshOwners, allMatchups);
            setUpdatedOwners(processedOwners);
            hasProcessed.current = true;
        };

        compileSeeds();

    }, [owners]);

    if (updatedOwners.length > 0) {
        console.log('Owners w/ seed trends data:', updatedOwners);
    };

    return (
        <div className="seed-trends">
            <h1>Seed Trends</h1>
            <p>updatedOwners will be used in a component here.</p>
        </div>
    );
}

export default SeedTrends;