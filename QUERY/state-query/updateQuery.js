const updateRESTQuery = (state, callback) => {

        const whereClause = `STATE_ABBR = '${state}'`
        
        
        statesRESTQuery({whereClause}, callback);
    };
        
    