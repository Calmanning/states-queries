const queryStatesFeatureViewEditor = (state, statesFeatureViewQuery) => {

    const queryTemplate = {
        
        where: `STATE_ABBR = '${state}'`,
        returnGeometry: true,
        returnQueriedGeometry: true,
        outFields: ["*"]
    }

    statesFeatureViewQuery(queryTemplate, state)

    };