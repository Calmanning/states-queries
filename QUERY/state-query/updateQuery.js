function updateQuery(state, callback) {
        const stateQueryWhereClause = `STATE_ABBR = '${state}'`
        
        
        statesQuery({stateQueryWhereClause}, callback);
    };
        
    