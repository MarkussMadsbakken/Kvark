import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Material UI Components
import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';

// Project components
import Pageination from './Pageination';

// Icons
import AddIcon from '@material-ui/icons/Add';
import DownloadIcon from '@material-ui/icons/CloudDownload';

const styles = (theme) => ({
  sidebar: {
    paddingTop: 64,
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: (props) => props.width,
    backgroundColor: theme.palette.colors.background.light,
    border: theme.palette.sizes.border.width + ' solid ' + theme.palette.colors.border.main,

    '@media only screen and (max-width: 800px)': {
      position: 'static',
      width: '100% !important',
      padding: 0,
    },
  },
  sidebarContent: {
    maxHeight: '100%',
    overflowY: 'auto',
  },
  sidebarTop: {
    backgroundColor: theme.palette.colors.background.main,
    color: theme.palette.colors.text.main,
    padding: '10px 5px 10px 12px',
    position: 'sticky',
    top: 0,
    zIndex: 200,
  },
  miniTop: {
    padding: '5px 5px 5px 12px',
  },
  listItem: {
    padding: '10px 10px',
    textAlign: 'left',
    color: theme.palette.colors.text.main,
  },
  listButton: {
    width: '100%',
  },
  selected: {
    backgroundColor: theme.palette.colors.tihlde.main,
    color: theme.palette.colors.constant.white,
  },
  progress: {
    display: 'block',
    margin: 'auto',
    marginTop: 10,

    '@media only screen and (max-width: 800px)': {
      order: 1,
    },
  },
});

const ListItem = withStyles(styles, { withTheme: true })((props) => {
  const { classes, onClick, selected, title, location } = props;
  return (
    <Fragment>
      <ButtonBase className={classes.listButton} onClick={onClick}>
        <Grid alignItems='center' className={classNames(classes.listItem, selected ? classes.selected : '')} container direction='row' justify='space-between'>
          <Grid container direction='column' justify='center'>
            <Typography color='inherit' variant='subtitle1'>
              {title}
            </Typography>
            <Typography color='inherit' variant='caption'>
              {location}
            </Typography>
          </Grid>
        </Grid>
      </ButtonBase>
      <Divider />
    </Fragment>
  );
});

ListItem.propTypes = {
  title: PropTypes.string,
  location: PropTypes.string,
};

const SidebarList = (props) => {
  const { classes, items, expiredItems, onItemClick, selectedItemId, getNextPage, nextPage, title, fetchExpired, hideExpired, isLoading } = props;

  return (
    <div className={classes.sidebar}>
      <Grid className={classNames(classes.sidebarContent, 'noScrollbar')} container direction='column' wrap='nowrap'>
        <Grid alignItems='center' className={classNames(classes.sidebarTop)} container direction='row' justify='space-between' wrap='nowrap'>
          <Typography color='inherit' variant='h6'>
            {title}
          </Typography>
          <IconButton onClick={() => onItemClick(null)}>
            <AddIcon />
          </IconButton>
        </Grid>
        <Pageination nextPage={getNextPage} page={nextPage}>
          {isLoading ? (
            <CircularProgress className={classes.progress} />
          ) : (
            items.map((value, index) => (
              <ListItem key={index} location={value.location} onClick={() => onItemClick(value)} selected={value.id === selectedItemId} title={value.title} />
            ))
          )}
        </Pageination>
        {!hideExpired && (
          <>
            <Grid
              alignItems='center'
              className={classNames(classes.sidebarTop, classes.miniTop)}
              container
              direction='row'
              justify='space-between'
              wrap='nowrap'>
              <Typography color='inherit' variant='h6'>
                Utgåtte
              </Typography>
              <IconButton onClick={fetchExpired}>
                <DownloadIcon />
              </IconButton>
            </Grid>
            {expiredItems.map((value, index) => (
              <ListItem key={index} location={value.location} onClick={() => onItemClick(value)} selected={value.id === selectedItemId} title={value.title} />
            ))}
          </>
        )}
      </Grid>
    </div>
  );
};

SidebarList.propTypes = {
  classes: PropTypes.object,
  items: PropTypes.array.isRequired,
  expiredItems: PropTypes.array,
  onItemClick: PropTypes.func.isRequired,
  selectedItemId: PropTypes.number,
  fetchExpired: PropTypes.func,
  getNextPage: PropTypes.func,
  nextPage: PropTypes.number,
  width: PropTypes.number,
  hideExpired: PropTypes.bool,
  title: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

SidebarList.defaultProps = {
  expiredItems: [],
  fetchExpired: () => {},
  width: 300,
  hideExpired: false,
  isLoading: false,
};

export default withStyles(styles)(SidebarList);
