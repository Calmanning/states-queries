function queryStatesEditor({mapPoint, stateQueryWhereClause, state}, callback) {
    console.log(mapPoint.x)
    console.log(mapPoint.y)

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