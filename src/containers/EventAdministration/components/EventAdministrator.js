import React, {Component, Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import {Link} from 'react-router-dom';
import URLS from '../../../URLS';
import {getUserStudyShort} from '../../../utils';

// API imports
import EventService from '../../../api/services/EventService';

// Material UI Components
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Project Components
import TextEditor from '../../../components/inputs/TextEditor';
import Dialog from '../../../components/navigation/Dialog';
import EventPreview from './EventPreview';
import EventSidebar from './EventSidebar';
import EventParticipants from './EventParticipants';
import EventOptionalFieldsCreator from './EventOptionalFieldsCreator';

const SIDEBAR_WIDTH = 300;

const styles = (theme) => ({
  root: {
    paddingLeft: SIDEBAR_WIDTH,
    paddingBottom: 50,
    '@media only screen and (max-width: 800px)': {
      padding: 0,
    },
  },
  field: {
    margin: '5px 0px',
    maxWidth: 300,
  },
  content: {
    width: '80%',
    maxWidth: 1100,
    marginTop: 50,
    display: 'block',
    margin: 'auto',
    padding: 36,
    border: theme.sizes.border.width + ' solid ' + theme.colors.border.main,
    borderRadius: theme.sizes.border.radius,
    backgroundColor: theme.colors.background.light,

    '@media only screen and (max-width: 800px)': {
      width: 'auto',
      margin: 10,
      padding: '36px 20px',
    },
  },
  margin: {
    margin: '10px 0px',
  },
  mr: {
    marginRight: 10,
    marginBottom: 5,
    flexGrow: 1,
  },
  link: {
    textDecoration: 'none',
  },
  header: {
    color: theme.colors.text.main,
  },
  switch: {
    color: theme.colors.text.light,
  },
  snackbar: {
    marginTop: 44,
    backgroundColor: theme.colors.status.red,
    color: theme.colors.constant.white,
  },
  messageView: {
    padding: 30,
    minWidth: 300,
    minHeight: 200,
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
  progress: {
    minHeight: 300,
  },
  flexRow: {
    margin: '10px 0',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    '@media only screen and (max-width: 800px)': {
      flexDirection: 'column',
    },
  },
  padding: {
    padding: '10px 5px',
  },
  expansionPanel: {
    width: '100%',
    boxShadow: '0px 2px 4px ' + theme.colors.border.main + '88',
    background: theme.colors.background.smoke,
  },
  formWrapper: {
    width: '100%',
  },
  formGroup: {
    padding: '10px 0',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    flexWrap: 'nowrap',
    '@media only screen and (max-width: 800px)': {
      gridTemplateColumns: '1fr',
    },
  },
  formGroupSmall: {
    padding: '10px 0',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  chipYes: {
    color: theme.colors.constant.white,
    backgroundColor: theme.colors.status.green,
    borderColor: theme.colors.status.green,
    '&:hover': {
      color: theme.colors.constant.white,
      backgroundColor: theme.colors.status.green + 'bb',
      borderColor: theme.colors.status.green + 'bb',
    },
  },
  chipNo: {
    color: theme.colors.status.red,
    backgroundColor: theme.colors.constant.white,
    borderColor: theme.colors.status.red,
    '&:hover': {
      color: theme.colors.status.red,
      borderColor: theme.colors.status.red,
    },
  },
  questionCount: {
    fontWeight: 'bold',
    color: theme.colors.text.lighter,
    marginLeft: 5,
  },
});

const MessageView = withStyles(styles, {withTheme: true})((props) => {
  const {classes} = props;
  return (
    <Grid className={classNames(classes.messageView, props.className)} container direction='column' alignItems='center' justify='center'>
      <Typography className={classes.margin} variant='h5' align='center'>{props.title}</Typography>
      <Button className={classes.margin} variant='contained' color='primary' onClick={props.onClick}>{props.buttonText}</Button>
    </Grid>
  );
});

const priorities = ['Lav', 'Middels', 'Høy'];
const eventCreated = 'Arrangementet ble opprettet';
const eventChanged = 'Endringen ble publisert';
const eventDeleted = 'Arrangementet ble slettet';
const userRemoved = 'Bruker ble fjernet fra arrangementet';
const errorMessage = (data) => 'Det oppstod en feil! '.concat(JSON.stringify(data || {}));
const snackbarHideDuration = 4000;

class EventAdministrator extends Component {

  constructor() {
    super();
    this.state = {
      isLocked: true,
      isLoading: false,
      isFetching: false,

      events: [],
      expired: [],
      categories: [],
      selectedEvent: null,

      title: '',
      location: '',
      startDate: new Date().toISOString().substring(0, 16),
      endDate: new Date().toISOString().substring(0, 16),
      startSignUp: new Date().toISOString().substring(0, 16),
      endSignUp: new Date().toISOString().substring(0, 16),
      signOffDeadline: new Date().toISOString().substring(0, 16),
      description: '',
      evaluateLink: '',
      signUp: false,
      optionalFields: [],
      priority: 0,
      registrationPriorities: [{'user_class': 1, 'user_study': 1}, {'user_class': 1, 'user_study': 2}, {'user_class': 1, 'user_study': 3}, {'user_class': 1, 'user_study': 5}, {'user_class': 2, 'user_study': 1}, {'user_class': 2, 'user_study': 2}, {'user_class': 2, 'user_study': 3}, {'user_class': 2, 'user_study': 5}, {'user_class': 3, 'user_study': 1}, {'user_class': 3, 'user_study': 2}, {'user_class': 3, 'user_study': 3}, {'user_class': 3, 'user_study': 5}, {'user_class': 4, 'user_study': 4}, {'user_class': 5, 'user_study': 4}],
      image: '',
      category: '',
      limit: 0,
      participants: [],
      userEvent: false,
      // imageAlt: '',

      showMessage: false,
      showDialog: false,
      errorMessage: 'Det oppstod en feil',
      showSuccessMessage: false,
      successMessage: eventCreated,
      showPreview: false,
      showParticipants: false,
    };
  }

  componentDidMount() {
    // Get all categories
    EventService.getCategories()
        .then((data) => {
          if (data) {
            this.setState({categories: data});
          }
        });

    // Get all events
    this.fetchEvents();
  }

    fetchEvents = (parameters = {page: 1}) => {
      // We need to add this in order to noe show expired events.
      parameters['newest'] = true;

      EventService.getEvents(parameters)
          .then((data) => {
            // For backward compabillity
            let displayedEvents = data.results || data;

            const nextPageUrl = data.next;
            const urlParameters = {};

            // If we have a url for the next page convert it into a object
            if (nextPageUrl) {
              const nextPageUrlQuery = nextPageUrl.substring(nextPageUrl.indexOf('?') + 1);
              const parameterArray = nextPageUrlQuery.split('&');
              parameterArray.forEach((parameter) => {
                const parameterString = parameter.split('=');
                urlParameters[parameterString[0]] = parameterString[1];
              });
            }

            // Get the page number from the object if it exists
            const nextPage = urlParameters['page'] ? urlParameters['page'] : null;

            this.setState((oldState) => {
              // If we allready have events
              if (this.state.events.length > 0) {
                displayedEvents = oldState.events.concat(displayedEvents);
              }
              return {events: displayedEvents, nextPage: nextPage};
            },
            );
          });
    }

    fetchExpired = () => {
      if (this.state.isFetching) {
        return;
      }

      this.setState({isFetching: false});
      EventService.getExpiredData((isError, data) => {
        if (!isError) {
          this.setState({expired: data.results || data || []});
        }
        this.setState({isFetching: true});
      });
    }

    onEventClick = (event) => {
      const {selectedEvent} = this.state;

      if (selectedEvent !== null && selectedEvent.id === event.id) {
        this.resetEventState();
      } else {
        this.setState({
          selectedEvent: event,
          title: event.title,
          location: event.location,
          description: event.description,
          evaluateLink: event.evaluate_link,
          priority: event.priority,
          registrationPriorities: event.registration_priorities,
          image: event.image,
          category: event.category,
          startDate: event.start_date.substring(0, 16),
          endDate: event.end_date.substring(0, 16),
          startSignUp: event.start_registration_at.substring(0, 16),
          endSignUp: event.end_registration_at.substring(0, 16),
          signOffDeadline: event.sign_off_deadline.substring(0, 16),
          signUp: event.sign_up,
          optionalFields: event.optionalFields,
          limit: event.limit,
          participants: [],
        });
      }
      this.setState({showSuccessMessage: false});

      // Fetch participants
      EventService.getEventParticipants(event.id).then((result) => {
        this.setState({participants: result});
      });
    }

    resetEventState = () => {
      this.setState({
        selectedEvent: null,
        title: '',
        location: '',
        description: '',
        evaluateLink: '',
        priority: 0,
        registrationPriorities: [{'user_class': 1, 'user_study': 1}, {'user_class': 1, 'user_study': 2}, {'user_class': 1, 'user_study': 3}, {'user_class': 1, 'user_study': 5}, {'user_class': 2, 'user_study': 1}, {'user_class': 2, 'user_study': 2}, {'user_class': 2, 'user_study': 3}, {'user_class': 2, 'user_study': 5}, {'user_class': 3, 'user_study': 1}, {'user_class': 3, 'user_study': 2}, {'user_class': 3, 'user_study': 3}, {'user_class': 3, 'user_study': 5}, {'user_class': 4, 'user_study': 4}, {'user_class': 5, 'user_study': 4}],
        image: '',
        imageAlt: '',
        category: '',
        startDate: new Date().toISOString().substring(0, 16),
        endDate: new Date().toISOString().substring(0, 16),
        startSignUp: new Date().toISOString().substring(0, 16),
        endSignUp: new Date().toISOString().substring(0, 16),
        signOffDeadline: new Date().toISOString().substring(0, 16),
        signUp: false,
        optionalFields: [],
        participants: [],
        showParticipants: false,
      });
    }

    handleChange = (name) => (event) => {
      event.persist();
      if (event.target.type === 'checkbox') {
        this.setState({[name]: event.target.checked});
      } else {
        this.setState({[name]: event.target.value});
      }
    }

    handleOptionalFields = (newOptionalFields) => {
      this.setState({optionalFields: newOptionalFields});
    }

    handlePriorityChange = (userClass, userStudy) => () => {
      if (this.state.registrationPriorities.some((item) => item.user_class === userClass && item.user_study === userStudy)) {
        const index = this.state.registrationPriorities.findIndex((item) => item.user_class === userClass && item.user_study === userStudy);
        const newArray = this.state.registrationPriorities;
        newArray.splice(index, 1);
        this.setState({registrationPriorities: newArray});
      } else {
        const newArray = this.state.registrationPriorities;
        newArray.push({'user_class': userClass, 'user_study': userStudy});
        this.setState({registrationPriorities: newArray});
      }
    }
    toggleAllPriorities = (addAll) => () => {
      if (addAll) {
        this.setState({registrationPriorities: [{'user_class': 1, 'user_study': 1}, {'user_class': 1, 'user_study': 2}, {'user_class': 1, 'user_study': 3}, {'user_class': 1, 'user_study': 5}, {'user_class': 2, 'user_study': 1}, {'user_class': 2, 'user_study': 2}, {'user_class': 2, 'user_study': 3}, {'user_class': 2, 'user_study': 5}, {'user_class': 3, 'user_study': 1}, {'user_class': 3, 'user_study': 2}, {'user_class': 3, 'user_study': 3}, {'user_class': 3, 'user_study': 5}, {'user_class': 4, 'user_study': 4}, {'user_class': 5, 'user_study': 4}]});
      } else {
        this.setState({registrationPriorities: []});
      }
    }

    handleToggleChange = (name) => () => {
      this.setState({[name]: !this.state[name]});
    }

    onChange = (name) => (value) => {
      this.setState({[name]: value});
    }

    toggleSnackbar = () => {
      this.setState({showMessage: !this.state.showMessage});
    }

    toggleSuccessView = () => {
      this.setState({showSuccessMessage: !this.state.showSuccessMessage});
    }

    getStateEventItem = () => ({
      title: this.state.title,
      location: this.state.location,
      description: this.state.description,
      evaluate_link: this.state.evaluateLink,
      priority: this.state.priority,
      registration_priorities: this.state.registrationPriorities,
      image: this.state.image,
      imageAlt: 'event',
      category: this.state.category,
      start_date: moment(this.state.startDate).format('YYYY-MM-DDTHH:mm'),
      end_date: moment(this.state.endDate).format('YYYY-MM-DDTHH:mm'),
      start_registration_at: moment(this.state.startSignUp).format('YYYY-MM-DDTHH:mm'),
      end_registration_at: moment(this.state.endSignUp).format('YYYY-MM-DDTHH:mm'),
      sign_off_deadline: moment(this.state.signOffDeadline).format('YYYY-MM-DDTHH:mm'),
      sign_up: this.state.signUp,
      optionalFields: this.state.optionalFields,
      limit: this.state.limit,
    });

    createNewEvent = (event) => {
      event.preventDefault();

      const item = this.getStateEventItem();

      this.setState({isLoading: true});

      // Create new Event Item
      EventService.createNewEvent(item, (isError, data) => {
        if (!isError) {
          const newEvents = Object.assign([], this.state.events);
          newEvents.unshift(data);
          this.setState({events: newEvents, showSuccessMessage: true, successMessage: eventCreated});
        } else {
          this.setState({showMessage: true, snackMessage: errorMessage(data)});
        }
        this.setState({isLoading: false});
      });
    }

    editEventItem = (event) => {
      event.preventDefault();

      const item = this.getStateEventItem();
      const {selectedEvent} = this.state;

      this.setState({isLoading: true});

      // Edit event
      EventService.putEvent(selectedEvent.id, item, (isError, data) => {
        if (!isError) {
          // Update stored event with the new data
          const newEvents = Object.assign([], this.state.events);
          const index = newEvents.findIndex((elem) => elem.id === selectedEvent.id); // Finding event by id
          if (index !== -1) {
            newEvents[index] = {id: selectedEvent.id, ...item};
            this.setState({events: newEvents, showSuccessMessage: true, successMessage: eventChanged});
          }
        } else {
          this.setState({showMessage: true, snackMessage: errorMessage(data)});
        }
        this.setState({isLoading: false});
      });
    }

    deleteEventItem = (event) => {
      event.preventDefault();

      const {selectedEvent} = this.state;

      this.setState({isLoading: true});

      // Create new Event Item
      EventService.deleteEvent(selectedEvent.id, (isError, data) => {
        if (isError === false) {
          // Remove the deleted event from the state
          const newEvents = Object.assign([], this.state.events);
          const index = newEvents.findIndex((elem) => elem.id === selectedEvent.id);
          if (index !== -1) {
            newEvents.splice(index, 1);
            this.setState({events: newEvents, selectedEvent: null, showSuccessMessage: true, successMessage: eventDeleted});
          }
        }
        this.setState({isLoading: false});
      });
    }

    removeUserFromEvent = () => {
      const {userId, event} = this.state.userEvent;

      EventService.deleteUserFromEventList(event.id, {user_id: userId}).then((result) => {
        this.setState((oldState) => {
          const newParticipants = oldState.participants.filter((user) => {
            if (user.user_info.user_id !== userId) return user;

            return false;
          });
          return {
            participants: newParticipants,
            showSuccessMessage: true,
            successMessage: userRemoved,

          };
        });
      }).catch((error) => {
        this.setState({showMessage: true, snackMessage: errorMessage(error)});
      });

      this.setState({showDialog: false});
    }

    toggleUserEvent = (userId, event, parameters) => {
      EventService.updateUserEvent(event.id, {user_id: userId, ...parameters}).then((data) => {
        this.setState((oldState) => {
          // Change the state to reflect the database data.
          const newParticipants = oldState.participants.map((user) => {
            let newUser = user;
            if (user.user_info.user_id === userId) {
              newUser = {...newUser, ...parameters};
            }
            return newUser;
          });
          return {participants: newParticipants};
        });
      }).catch((error) => {
        this.setState({showMessage: true, snackMessage: errorMessage(error)});
      });
    }

    closeEvent = () => {
      const {selectedEvent} = this.state;
      EventService.putEvent(selectedEvent.id, {closed: true}).then(() => {
        this.setState((oldState) => {
          const newEvent = oldState.selectedEvent;
          newEvent.closed = true;
          return {selectedEvent: newEvent};
        });
      });
    }

    confirmRemoveUserFromEvent = (userId, event) => {
      this.setState({showDialog: true, userEvent: {user_id: userId, event: event}});
    }

    getNextPage = () => {
      this.fetchEvents({page: this.state.nextPage});
    }

    render() {
      const {classes} = this.props;
      const {selectedEvent, title, location, description, evaluateLink, image, priority, registrationPriorities, categories, category, signUp, optionalFields, showParticipants, limit, participants} = this.state;
      const selectedEventId = (selectedEvent) ? selectedEvent.id : null;
      const isNewItem = (selectedEvent === null);
      const header = (isNewItem) ? 'Lag et nytt arrangement' : 'Endre arrangement';

      return (
        <Fragment>
          <div className={classes.root}>
            <Snackbar
              open={this.state.showMessage}
              autoHideDuration={snackbarHideDuration}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              onClose={this.toggleSnackbar}>

              <SnackbarContent
                className={classes.snackbar}
                message={this.state.snackMessage}/>
            </Snackbar>

            <Dialog
              onClose={() => this.setState({showDialog: false, userEvent: false})}
              status={this.state.showDialog}
              title='Bekreft sletting'
              message={'Er du sikker på at du vil fjerne denne brukeren fra dette arrangementet?'}
              submitText={'Slett'}
              onSubmit={this.removeUserFromEvent} />

            <div className={classes.content}>
              {showParticipants ?
                        <EventParticipants
                          removeUserFromEvent={this.confirmRemoveUserFromEvent}
                          participants={participants}
                          event={selectedEvent}
                          closeParticipants={this.handleToggleChange('showParticipants')}
                          toggleUserEvent={this.toggleUserEvent} /> :
                      <React.Fragment>
                        {(this.state.isLoading) ? <Grid className={classes.progress} container justify='center' alignItems='center'><CircularProgress /></Grid> :
                          (this.state.showSuccessMessage) ? <MessageView title={this.state.successMessage} buttonText='Nice' onClick={this.toggleSuccessView}/> :
                              <form>
                                <Grid container direction='column' wrap='nowrap'>
                                  <Typography className={classes.header} variant='h5'>{header}</Typography>
                                  <TextField className={classes.field} label='Tittel' value={title} onChange={this.handleChange('title')} required/>
                                  <TextField className={classes.field} label='Sted' value={location} onChange={this.handleChange('location')} required/>
                                  <TextField className={classes.field} label='Antall plasser' value={limit} onChange={this.handleChange('limit')} required/>
                                  <FormControlLabel
                                    className={classes.switch}
                                    control={
                                      //   <Checkbox onChange={this.handleChange('signUp')} checked={signUp} />
                                      <Switch checked={signUp} onChange={this.handleChange('signUp')} color="primary" />
                                    }
                                    label="Åpen for påmelding"/>
                                  {signUp && <div className={classes.flexRow}>
                                    <TextField className={classes.margin} fullWidth type='datetime-local' pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" label='Start påmelding' value={this.state.startSignUp} onChange={this.handleChange('startSignUp')} />
                                    <TextField className={classes.margin} fullWidth type='datetime-local' pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" label='Slutt påmelding' value={this.state.endSignUp} onChange={this.handleChange('endSignUp')} />
                                    <TextField className={classes.margin} fullWidth type='datetime-local' pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" label='Avmeldingsfrist' value={this.state.signOffDeadline} onChange={this.handleChange('signOffDeadline')} />
                                  </div>}
                                  {signUp && <div className={classes.flexRow}>
                                    <TextField className={classes.margin} fullWidth label='Link til evalueringsundersøkelse' value={evaluateLink} onChange={this.handleChange('evaluateLink')}/>
                                  </div>}
                                  {signUp && registrationPriorities &&
                                      <div className={classes.flexRow}>
                                        <ExpansionPanel className={classes.expansionPanel}>
                                          <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="priorities"
                                            id="priorities-header"
                                          >
                                            <Typography className={classes.heading}>Prioriterte</Typography>
                                          </ExpansionPanelSummary>
                                          <ExpansionPanelDetails>
                                            <div className={classes.formWrapper}>
                                              <FormGroup className={classes.formGrou}>
                                                {[1, 2, 3, 5].map((userStudy) => {
                                                  return (
                                                    <React.Fragment key={userStudy}>
                                                      <FormLabel component="legend">{getUserStudyShort(userStudy)}</FormLabel>
                                                      <FormGroup className={classes.formGroup} key={userStudy}>
                                                        {[1, 2, 3].map((userClass) => {
                                                          return (
                                                            <Button
                                                              key={userClass}
                                                              className={classes.mr}
                                                              classes={registrationPriorities.some((item) => item.user_class === userClass && item.user_study === userStudy) ? {outlinedPrimary: classes.chipYes} : {outlinedPrimary: classes.chipNo}}
                                                              variant='outlined'
                                                              color='primary'
                                                              onClick={this.handlePriorityChange(userClass, userStudy)}>
                                                              {userClass + '. ' + getUserStudyShort(userStudy)}
                                                            </Button>
                                                          );
                                                        })}
                                                      </FormGroup>
                                                    </React.Fragment>
                                                  );
                                                })}
                                                <FormLabel component="legend">{getUserStudyShort(4)}</FormLabel>
                                                <FormGroup className={classes.formGroup}>
                                                  <Button
                                                    className={classes.mr}
                                                    classes={registrationPriorities.some((item) => item.user_class === 4 && item.user_study === 4) ? {outlinedPrimary: classes.chipYes} : {outlinedPrimary: classes.chipNo}}
                                                    variant='outlined'
                                                    color='primary'
                                                    onClick={this.handlePriorityChange(4, 4)}>
                                                    {4 + '. ' + getUserStudyShort(4)}
                                                  </Button>
                                                  <Button
                                                    className={classes.mr}
                                                    classes={registrationPriorities.some((item) => item.user_class === 5 && item.user_study === 4) ? {outlinedPrimary: classes.chipYes} : {outlinedPrimary: classes.chipNo}}
                                                    variant='outlined'
                                                    color='primary'
                                                    onClick={this.handlePriorityChange(5, 4)}>
                                                    {5 + '. ' + getUserStudyShort(4)}
                                                  </Button>
                                                </FormGroup>
                                              </FormGroup>
                                              <FormGroup className={classes.formGroupSmall}>
                                                <Button className={classes.mr} variant='outlined' color='primary' onClick={this.toggleAllPriorities(true)}>Alle</Button>
                                                <Button className={classes.mr} variant='outlined' color='primary' onClick={this.toggleAllPriorities(false)}>Ingen</Button>
                                              </FormGroup>
                                            </div>
                                          </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                      </div>}
                                  {signUp && optionalFields &&
                                        <div className={classes.flexRow}>
                                          <ExpansionPanel className={classes.expansionPanel}>
                                            <ExpansionPanelSummary
                                              expandIcon={<ExpandMoreIcon />}
                                              aria-controls="priorities"
                                              id="priorities-header"
                                            >
                                              <Typography className={classes.heading}>Spørsmål ved påmelding <span className={classes.questionCount}>({optionalFields && optionalFields.length})</span></Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                              <EventOptionalFieldsCreator optionalFields={optionalFields} handleOptionalFields={this.handleOptionalFields} />
                                            </ExpansionPanelDetails>
                                          </ExpansionPanel>
                                        </div>
                                  }

                                  <TextEditor className={classes.margin} value={description} onChange={this.onChange('description')}/>

                                  <Divider className={classes.margin} />

                                  <TextField className={classes.margin} fullWidth label='Bilde' value={image} onChange={this.handleChange('image')}/>

                                  <div className={classes.flexRow}>
                                    <TextField className={classes.margin} select fullWidth label='Proritering' value={priority} onChange={this.handleChange('priority')}>
                                      {priorities.map((value, index) => (
                                        <MenuItem key={index} value={index}>
                                          {value}
                                        </MenuItem>
                                      ))}
                                    </TextField>

                                    <TextField className={classes.margin} select fullWidth label='Kategori' value={category} onChange={this.handleChange('category')}>
                                      {categories.map((value, index) => (
                                        <MenuItem key={index} value={value.id}>
                                          {value.text}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </div>
                                  <div className={classes.flexRow}>
                                    <TextField className={classes.margin} fullWidth type='datetime-local' pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" label='Start dato' value={this.state.startDate} onChange={this.handleChange('startDate')} />
                                    <TextField className={classes.margin} fullWidth type='datetime-local' pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" label='Slutt dato' value={this.state.endDate} onChange={this.handleChange('endDate')} />
                                  </div>

                                  <Grid container direction='row' wrap='nowrap' justify='space-between'>
                                    {(isNewItem) ?
                                              <div>
                                                <Button className={classes.mr} onClick={this.createNewEvent} type='submit' variant='contained' color='primary'>Lag nytt event</Button>
                                                <Button variant='outlined' color='primary' onClick={this.handleToggleChange('showPreview')}>Preview</Button>
                                              </div> :
                                              <Fragment>
                                                <div>
                                                  <Button className={classes.mr} onClick={this.editEventItem} variant='contained' type='submit' color='primary'>Lagre</Button>
                                                  <Button className={classes.mr} variant='outlined' color='primary' onClick={this.handleToggleChange('showPreview')}>Preview</Button>
                                                  <Button className={classes.mr} variant='outlined' color='primary' onClick={this.handleToggleChange('showParticipants')}>Se påmeldte</Button>
                                                  <Link to={URLS.events.concat(selectedEventId).concat('/registrering/')} className={classes.link}><Button className={classes.mr} variant='outlined' color='primary'>Registrer ankomne</Button></Link>
                                                </div>
                                                <div>
                                                  <Button disabled={selectedEvent.closed && true} className={classNames(classes.mr, classes.deleteButton)} onClick={this.closeEvent} variant='outlined'>Steng</Button>
                                                  <Button className={classNames(classes.mr, classes.deleteButton)} onClick={this.deleteEventItem} variant='outlined'>Slett</Button>
                                                </div>
                                              </Fragment>
                                    }
                                  </Grid>
                                </Grid>
                              </form>
                        }
                      </React.Fragment>
              }
            </div>

          </div>
          <EventSidebar
            events={this.state.events}
            expiredEvents={this.state.expired}
            selectedEventId={selectedEventId}
            onEventClick={this.onEventClick}
            resetEventState={this.resetEventState}
            fetchExpired={this.fetchExpired}
            nextPage={this.state.nextPage}
            getNextPage={this.getNextPage}
          />
          <EventPreview data={this.getStateEventItem()} open={this.state.showPreview} onClose={this.handleToggleChange('showPreview')}/>
        </Fragment>
      );
    }
}

EventAdministrator.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, {withTheme: true})(EventAdministrator);
