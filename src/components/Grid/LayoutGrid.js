import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';

// Import GRID from JSON
// NOTE: grid_minmal.json contains fewer grid elements than grid.json,
// and as grid.json is loaded from the Tihlde API, we can see it working,
// while retaining a semi functional site when it does not work.
import GridData from '../../data/grid_minimal.json';

// Grid Items/Widgets
import EventList from '../EventList';
import Jodel from '../Jodel/Jodel';
import Poster from '../Poster';
import NewsItem from '../NewsItem';

import GridItem from './GridItem';

const styles = {
    root: {
        display: 'grid',
        // gridTemplateAreas: GridData.gridAreas,
        gridTemplateColumns: 'repeat(' + GridData.gridColumns + ', 1fr)',
        gridTemplateRows: 'auto',
        gridGap: '5px',

        maxWidth: 1400,
        margin: 'auto',
        marginBottom: 50,
        padding: '0 5px 5px 5px',

        '@media only screen and (max-width: 1000px)': {
            gridTemplateColumns: '1fr 1fr',
        },

        '@media only screen and (max-width: 800px)': {
           gridTemplateColumns: '100%',
           padding: '0 5px',
        },
    },
};

// Creates a item based on the type
const getItem = (id, type, data) => {
    switch (type) {
        case 'eventlist':
            return <EventList id={id} data={data}/>;
        case 'news':
            return <NewsItem id={id} data={data}/>;
        case 'jodel':
            return <Jodel id={id} data={data}/>;
        case 'poster':
            return <Poster id={id} data={data}/>;
        default:
            return null;
    }
};

class LayoutGrid extends Component {

    constructor() {
        super();

        this.state = {
            children: GridData.children,
        };
    }

    render() {
        const {classes, grid} = this.props;
        const children = (grid)? grid : [];

        return (
            <div className={classes.root}>
                {children.map((value, index) => {
                    return (
                        <GridItem key={index} rowSpan={value.height} colSpan={value.width} fullWidth={value.fullWidth} order={value.order}> {/* Wraps the entire item in a GridItem with specifed row- and colspan */}
                            {getItem(value.id, value.type, value.data)}
                        </GridItem>
                    );
                })}
            </div>
        );
    }
}

LayoutGrid.propTypes = {
    classes: PropTypes.object,
    grid: PropTypes.array,
};

export default withStyles(styles)(LayoutGrid);
