import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from './components/App';
import Home from './components/Home';
import ComingSoon from './components/ComingSoon';
import Contact from './components/Contact';
import EventDetail from './components/EventDetail';
import NotFound from './components/NotFound';
import ThankYou from './components/ThankYou';
import ThankYouOnline from './components/ThankYouOnline';
import Login from './components/Account/Login';
import Signup from './components/Account/Signup';
import Profile from './components/Account/Profile';
import Forgot from './components/Account/Forgot';
import Reset from './components/Account/Reset';
import Followup from './components/Followup/Index';

import Courses from './components/Courses';
import Referral from './components/Referral';

export default function getRoutes(store) {
  const ensureAuthenticated = (nextState, replace) => {
    if (!store.getState().auth.token) {
      replace('/login');
    }
  };
  const skipIfAuthenticated = (nextState, replace) => {
    if (store.getState().auth.token) {
      replace('/');
    }
  };
  const clearMessages = () => {
    store.dispatch({
      type: 'CLEAR_MESSAGES'
    });
  };
  return (
    <Route exact path="/" component={App}>
      <IndexRoute component={ComingSoon} onLeave={clearMessages}/>
      <Route exact path="/:state/:city/:eventname/:eventsid/:eventid" component={EventDetail} onLeave={clearMessages}/>
      <Route path="/:state/:city/:eventname/:eventsid" component={EventDetail} onLeave={clearMessages}/>
      <Route path="/online/event/:eventname/:eventsid/:eventid" component={EventDetail} onLeave={clearMessages}/>
      <Route path="/online/event/:eventname/:eventsid" component={EventDetail} onLeave={clearMessages}/>
      <Route path="/events" component={Home} onLeave={clearMessages}/>
      <Route path="/contact" component={Contact} onLeave={clearMessages}/>
      <Route path="/product-group" component={Followup} onLeave={clearMessages}/>

	  <Route path="/courses" component={Courses} onLeave={clearMessages}/>
	  <Route path="/referral" component={Referral} onLeave={clearMessages}/>

      <Route path="/login" component={Login} onEnter={skipIfAuthenticated} onLeave={clearMessages}/>
      <Route path="/online/event/:eventname/:eventsid/:eventid/thankyou" component={ThankYouOnline} onLeave={clearMessages}/>
      <Route path="/:state/:city/:eventname/:eventsid/:eventid/thankyou" component={ThankYou} onLeave={clearMessages}/> 
      <Route path="/signup" component={Signup} onEnter={skipIfAuthenticated} onLeave={clearMessages}/>
      <Route path="/account" component={Profile} onEnter={ensureAuthenticated} onLeave={clearMessages}/>
      <Route path="/forgot" component={Forgot} onEnter={skipIfAuthenticated} onLeave={clearMessages}/>
      <Route path='/reset/:token' component={Reset} onEnter={skipIfAuthenticated} onLeave={clearMessages}/>
      <Route path="/notfound" component={NotFound} onLeave={clearMessages}/>
      <Route path="*" component={NotFound} onLeave={clearMessages}/>
    </Route>
  );
}
