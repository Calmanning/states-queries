function getCityListHeadings(cityQueryResults){
        
        let containerHeadings = Object.keys(cityQueryResults.features[0].attributes).map((headers) => {
            return `<span>${headers}</span>`
        }).join(" ")
        
        getCityListEntries(cityQueryResults, containerHeadings)
    };
    
    const cityListContainer = document.createElement("div")
      cityListContainer.setAttribute("id", "cityList")  

    const getCityListEntries = (cityQueryResults, containerHeadings)=>{
        let cityList = cityQueryResults.features.map((city) => {
            
            let town = city.attributes.NAME
    
            let population  = city.attributes.POPULATION

            return (
                `<p>${town}: ${population}</p>`
            )
        }).join("");
        document.getElementById("dataDiv").append(cityListContainer);
       cityListContainer.innerHTML = `<h3>${containerHeadings}</h3>${cityList}`
    };