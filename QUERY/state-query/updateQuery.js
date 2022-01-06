function updateQuery(state) {
        const stateQueryWhereClause = `STATE_ABBR = '${state}'`
        
        queryStatesEditor({stateQueryWhereClause, state});
    };
        
    