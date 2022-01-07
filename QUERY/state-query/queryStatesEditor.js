function queryStatesEditor(state, statesQuery) {

    const queryTemplate = {
        
        where: `STATE_ABBR = '${state}'`,
        returnGeometry: true,
        returnQueriedGeometry: true,
        outFields: ["*"]
    }
    
    // let queryClauseAdjustment = (stateQueryWhereClause) 
    //     ? queryTemplate.where = stateQueryWhereClause 
    //     : queryTemplate.geometry = mapPoint;

    // queryTemplate.url = stateBoudariesLayerUrl;

    statesQuery(queryTemplate, state)

    };