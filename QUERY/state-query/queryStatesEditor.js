function queryStatesEditor({mapPoint, stateQueryWhereClause, state}, callback) {


    const queryTemplate = {
        
        returnGeometry: true,
        returnQueriedGeometry: true,
        outFields: ["*"]
    }
    
    let queryClauseAdjustment = (stateQueryWhereClause) 
        ? queryTemplate.where = stateQueryWhereClause 
        : queryTemplate.geometry = mapPoint;

    queryTemplate.url = stateBoudariesLayerUrl;

    statesQuery(queryTemplate, callback)

    };