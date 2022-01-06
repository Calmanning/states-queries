function updateQuery(state, callback) {
        const stateQueryWhereClause = `STATE_ABBR = '${state}'`
        
        
        queryStatesEditor({stateQueryWhereClause, state}, callback);
    };
        
    