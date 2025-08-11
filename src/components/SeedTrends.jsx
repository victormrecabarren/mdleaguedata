const SeedTrends = ({ owners }) => {

    if (owners.length > 0) {
        console.log('Owners w/ seed trends data:', owners);
    };

    return (
        <div className="seed-trends">
            <h1>Seed Trends</h1>
            <p>updatedOwners will be used in a component here.</p>
        </div>
    );
}

export default SeedTrends;