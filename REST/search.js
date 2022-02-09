console.log("rest connected");

//left search
const searchInput = document.createElement ("input")
    searchInput.setAttribute("id", "searchInput")
    searchInput.setAttribute("placeholder", "Enter search terms")
    searchInput.setAttribute("label", "General Search")
document.getElementById("searchDiv").append(searchInput)


searchInput.addEventListener("change", (event) => {
    console.log(event.target.value)
    const term = event.target.value;
    genSearch(term)
})

//right search
const rightSearchInput = document.createElement ("input")
    rightSearchInput.setAttribute("id", "rightSearchInput")
    
    rightSearchInput.setAttribute("placeholder", "Group Search terms")
    rightSearchInput.setAttribute("label", "General Search")
document.getElementById("searchDiv").append(rightSearchInput)

    rightSearchInput.addEventListener("change", (event) => {
        console.log(event.target.value)
        const term = event.target.value;
        groupContentSearch(term)
    })



const day = parseInt(Date.now());


const date = `(created:[])`;
const categories = [""]
const countFields = 'tags, type'

//-type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration" -type:"Map Area" -typekeywords:"MapAreaPackage" -type:"Indoors Map Configuration" -typekeywords:"SMX"
const genSearch = (term) =>{
    console.log(term)
    const searchURL = 'https://www.arcgis.com/sharing/rest/search?';

    const params = {
    num: 7,
    start: 0,
    sortField: 'title',
    sortOrder: '',
    q: `(${term})`,
    categories: ``,
    filter: 'type:"web map"',
    countFields: `${countFields}`,
    countSize: 200,
    f:'json'
    }
    
    axios.get(searchURL,{
        
        params
    })
    .then((response) => {
        console.log(response)
        response.data.results.map(res => {
            const title = res.title
            console.log(title, res.snippet)
            
        })
        generateList(response)
    });
}


const groupContentSearch = (term) => {

    const groupID = 'a179c67d72c745709a7d95dd41922650'

    const groupURL = `https://www.arcgis.com/sharing/rest/content/groups/${groupID}/search?`

    const params = {
    num: 7,
    start: 0,
    sortField: 'title',
    sortOrder: '',
    q: `(${term}) -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration" -type:"Map Area" -typekeywords:"MapAreaPackage" -type:"Indoors Map Configuration" -type:"deep learning package" -typekeywords:"SMX"`,
    categories: "",
    filter: '',
    countFields: `${countFields}`,
    countSize: 200,
    f:'json'
    }

    axios.get(groupURL, {
        params
    })
    .then((response) => {
        console.log(response)
    
        generateList(response)
    });
}


const responseList = document.createElement("div")
responseList.setAttribute("id", "responseList")

const responseItem = document.createElement("div")
responseItem.setAttribute("id", "responseItems")
document.getElementById("responseDiv").append(responseList)

const rightResponseList = document.createElement("div")
    rightResponseList.setAttribute("id", "responseList")
    
const rightResponseItem = document.createElement("div")
document.getElementById("responseDiv").append(responseList)
rightResponseList.append(responseItem);


const generateList = (response) => {

    responseItem.innerHTML= ""


    listEntries = response.data.results.map((res)=> {
        return `<h3>${res.title ? res.title : "No title available"}</h3>
                <p>${res.snippet ? res.snippet : "No description available"}</p>`
    })
    
    responseItem.innerHTML = listEntries.join("");
    responseList.append(responseItem);
}

const groupCategories = document.createElement("div");

groupCategories.setAttribute('id', 'groupCategories');
document.getElementById("searchDiv").append(groupCategories)

//get request to the schema categories
const getGroupContentCategories = () => {
    const groupID = 'a179c67d72c745709a7d95dd41922650'
                    
    const groupSchemeURL = `https://arcgis-content.maps.arcgis.com/sharing/rest/community/groups/${groupID}/categorySchema?`
    
    axios.get(groupSchemeURL, {
        params: {
            // categories: "/Categories/Transportation and Infrastructure/" ,
            f: 'json',
            
        }
    })
    .then((response) =>{
        console.log(response)
        const cates = response.data.categorySchema[0].categories.map((res) => {
            console.log(res)
            // res.categories.forEach(subCat =>console.log(subCat.title))
            
            return `<p>${res.title}</p>`
                    
        })
        
        const subCats = response.data.categorySchema[0].categories.map((res) => {
            console.log(res.categories)
             
            return  `<em>${res[0].categories}</em>`
            
        })
        console.log(cates)
        console.log(subCats)
        groupCategories.innerHTML = (`<h3>Policy Group Categories</h3>` + cates.join("") + subCats.join())
    })
}
getGroupContentCategories()


const categorySearchTesting = () => {

    const groupID = 'a179c67d72c745709a7d95dd41922650'

    const groupURL = `https://www.arcgis.com/sharing/rest/content/groups/${groupID}/search?`

    const params = {
    num: 7,
    start: 0,
    sortField: 'title',
    sortOrder: '',
    q: ` -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration" -type:"Map Area" -typekeywords:"MapAreaPackage" -type:"Indoors Map Configuration" -type:"deep learning package" -typekeywords:"SMX"`,
    categories: "/Categories/Transportation and Infrastructure, Categories/Social Equity and Health",
    filter: '',
    countFields: `${countFields}`,
    countSize: 200,
    f:'json'
    }

    axios.get(groupURL, {
        params
    })
    .then((response) => {
        console.log(response)
    
    });
}
categorySearchTesting()