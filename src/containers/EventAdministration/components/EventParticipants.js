import React, {useState} from 'react';
import PropTypes from 'prop-types';

// Material-UI
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

// Project
import EventParticipant from './EventParticipant';
import EventStatistics from './EventStatistics';

const styles = (theme) => ({
  header: {
    display: 'flex',
    padding: 2,
    '@media only screen and (max-width: 800px)': {
      flexDirection: 'column',
    },
  },
  heading: {
    width: '100%',
  },
  numbers: {
    minWidth: 160,
    textAlign: 'end',
    display: 'flex',
    justifyContent: 'end',
    flexDirection: 'column',
    '@media only screen and (max-width: 800px)': {
      textAlign: 'start',
    },
  },
  content: {
    paddingTop: 36,
    paddingBottom: 4,
  },
  listView: {
    width: '100%',
    paddingBottom: 36,
    paddingTop: 8,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkbox: {
    marginTop: '-6px',
    marginBottom: '-6px',
  },
  mainText: {
    color: theme.colors.text.main,
  },
  lightText: {
    color: theme.colors.text.light,
  },
});

const EventParticipants = (props) => {
  const {classes, event, closeParticipants, participants, removeUserFromEvent, toggleUserEvent} = props;

  const [showOnlyNotAttended, setCheckedState] = useState(false);

  const sortParticipants = (waitList) => {
    return participants.filter((user) => {
      let include = false;
      if (waitList && user.is_on_wait) {
        include = true;
      } else if (!waitList && !user.is_on_wait) {
        include = true;
      }
      return include;
    });
  };

  let participantsIn = [];
  let participantsOnWait = [];
  if (participants.length > 0) {
    participantsIn = sortParticipants(false);
    participantsOnWait = sortParticipants(true);
  }

  const handleCheck = (actionEvent) => {
    setCheckedState(actionEvent.target.checked);
  };

  const printParticipants = (waitList, notAttended) => {
    let elements = <Typography className={classes.lightText}>Ingen påmeldte.</Typography>;
    let participantsToPrint;

    participantsToPrint = waitList ? participantsOnWait : participantsIn;

    if (notAttended) {
      participantsToPrint = participantsToPrint.filter((u) => {
        return !u.has_attended;
      });
    }

    if (participantsToPrint.length > 0) {
      elements = participantsToPrint.map((user, key) => {
        return <EventParticipant
          key={key}
          waitList={waitList}
          attended={user.has_attended}
          event={event}
          removeUserFromEvent={removeUserFromEvent}
          toggleUserEvent={toggleUserEvent}
          user={user} />;
      });
    }

    return elements;
  };

  return (
    <React.Fragment>
      <div className={classes.header}>
        <div className={classes.heading}>
          <Typography className={classes.mainText} variant='h4'>{event.title}</Typography>
        </div>
        <div className={classes.numbers}>
          <Typography className={classes.lightText}>Antall påmeldte: {participantsIn.length}</Typography>
          <Typography className={classes.lightText}>Antall på venteliste: {participantsOnWait.length}</Typography>
        </div>
      </div>
      <Divider />
      <div className={classes.content}>
        { participantsIn.length > 0 &&
        <div>
          <Typography className={classes.mainText} variant='h5'>Statistikk</Typography>
          <div className={classes.listView}>
            <EventStatistics participants={participantsIn} />
          </div>
        </div>
        }
        <div className={classes.flexRow}>
          <Typography className={classes.mainText} variant='h5'>Påmeldte</Typography>
          <FormControlLabel
            className={classes.lightText}
            label="Ikke ankommet"
            labelPlacement="start"
            control={
              <Checkbox
                className={classes.checkbox}
                onChange={
                  handleCheck
                }
                checked={showOnlyNotAttended} />}
          />
        </div>

        <div className={classes.listView}>
          {printParticipants(false, showOnlyNotAttended)}
        </div>
        <Typography className={classes.mainText} variant='h5'>Venteliste</Typography>
        <div className={classes.listView}>
          {printParticipants(true)}
        </div>
      </div>
      <Button
        onClick={closeParticipants}
        variant='outlined'
        color='primary'>Tilbake</Button>
    </React.Fragment>
  );
};

EventParticipants.propTypes = {
  classes: PropTypes.object,
  event: PropTypes.object,
  closeParticipants: PropTypes.func,
  toggleUserEvent: PropTypes.func,
  participants: PropTypes.array,
  removeUserFromEvent: PropTypes.func,
};

export default withStyles(styles)(EventParticipants);
