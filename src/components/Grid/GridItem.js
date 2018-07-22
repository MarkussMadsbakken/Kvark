import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';


const styles = {
    root: {
        gridColumn: 'span 1',
        gridRow: 'span 1',
    },
    width2: {
        gridColumn: 'span 2',

        '@media only screen and (max-width: 1000px)': {
            gridColumn: 'span 1 !important',
        },

        '@media only screen and (max-width: 800px)': {
            gridColumn: 'span 1 !important',
            margin: '0 !important',
        },
    },
    width3: {
        gridColumn: 'span 3',

        '@media only screen and (max-width: 1000px)': {
            gridColumn: 'span 2 !important',
        },

        '@media only screen and (max-width: 800px)': {
            gridColumn: 'span 1 !important',
            
        },
    },
    width4: {
        gridColumn: 'span 4',

        '@media only screen and (max-width: 1000px)': {
            gridColumn: 'span 2 !important',
        },

        '@media only screen and (max-width: 800px)': {
            gridColumn: 'span 1 !important',
            
        },
    },
    height2: {
        gridRow: 'span 2',
    },
    fullWidth: {
        height: 500,
        marginBottom: '-100px',
        gridColumn: '1/4',

        '@media only screen and (max-width: 1000px)': {
            gridColumn: 'span 2 !important',
        },

        '@media only screen and (max-width: 800px)': {
            gridColumn: 'span 1 !important',
            height: 300,
            marginBottom: '-10px',
        },
    },
}

class GridItem extends Component {

    render() {
        const classes = [
            this.props.classes.root,
            this.props.colSpan === 2 ? this.props.classes.width2 : '',
            this.props.colSpan === 3 ? this.props.classes.width3 : '',
            this.props.colSpan === 4 ? this.props.classes.width4 : '',
            this.props.rowSpan === 2 ? this.props.classes.height2: '',
            this.props.fullWidth ? this.props.classes.fullWidth : '',
        ].join(' ');

        return (
            <div className={ classes } style={{zIndex: 10}}>
                { this.props.children }
            </div>
        );
    }
}

GridItem.defaultProps = {
    rowSpan: 1,
    colSpan: 1,
}

GridItem.propTypes = {
    rowSpan: PropTypes.number,
    colSpan: PropTypes.number,
}

export default withStyles(styles)(GridItem);