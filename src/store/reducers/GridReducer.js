const initialState = {
    grid: [],
    selectedItem: null, // Item that will be used on detailpages
    snackHasDisplayed: false, // A control bool for controlling of the snackbar has displayed or not
};

export default function reducer(state = initialState, action) {
    const data = action.payload;
    if(!isPayloadValid(data)) {
        return state;
    }

    switch (action.type) {

        case "SET_GRID_ITEMS": { // TODO: Make this happend at backend instead
            const news = data.filter(e => e.type === 'news'); // All the news
            let gridData = data.filter(e => e.type !== 'news'); // Everything, except the news
            if(news.length > 0) {
                gridData.push(createNewsItem(news)); // Add news as one unit
                gridData.sort((a, b) => a.order - b.order); // Sort on order - This should really be done on the backend
            }
            
            return {...state, grid: gridData}
        }

        case "SELECT_STORED_ITEM": {
            return {...state, selectedItem: state.grid.find(state.grid.findIndex(elem => elem.id === data))}
        }

        case "SET_SELECTED_ITEM": {
            return {...state, selectedItem: data}
        }

        case "SET_SNACK_DISPLAYED": {
            return {...state, snackHasDisplayed: data}
        }

        default:
            return state;
    }
};

// SELECTORS

const getGridState = (state) => state.grid;

export const getEventById = (state) => (id) => getGridState(state).grid.find(e => e.type === 'event' && e.id === id);

// Helper functions

// Checks if action.payload data is not null or undefined
const isPayloadValid = (payload) => {
    return (typeof(payload) !== undefined);
};

const createNewsItem = (news) => ({
    data: news, type: 'news', height: 2, width: 2, fullWidth: false, hideOnMobile: false, order: -10,
});
