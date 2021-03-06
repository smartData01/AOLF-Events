import React from 'react';
import { connect } from 'react-redux'
import { submitContactForm } from '../../../actions/contact';
import Messages from '../../Messages';
import { browserHistory } from 'react-router';
import { withRouter } from 'react-router'
import fetch from 'isomorphic-fetch'

//import GoogleTagManager from './GoogleTagManager';
import ReactGA from 'react-ga';

class Contact extends React.Component {
	constructor(props) {
		super(props);
		this.onSuccess = this.onSuccess.bind(this);
		this.onError = this.onError.bind(this);
		this.state = { id: '', name: '', email: '', tel: '', event: {}, events: {}, addClassName: '', userdetail: {} };
		this.onSubmit = true;

		this.GAUnlocked = true;
	}

	handleChange(event) {
		var flag = true;

		if (event.target.name == 'name') {
			$(this.name).next().html('');
			if (!event.target.value) {
				$(this.name).next().html('Please fill this field');
				flag = false;
			}
		}

		if (event.target.name == 'tel') {
			$(this.tel).next().html('');

			if (isNaN(parseFloat(event.target.value)) && !isFinite(event.target.value)) {
				$(this.tel).next().html('Please use valid number');
				flag = false;
			}

			if (!event.target.value) {
				$(this.tel).next().html('Please fill this field');
				flag = false;
			}

			if (event.target.value.length > 10) {
				$(this.tel).next().html('Please use 10 digit mobile number');
				flag = false;
			}
		}

		if (event.target.name == 'email') {
			var email = event.target.value;
			$(this.email).next().html('');

			if (!email) {
				$(this.email).next().html('Please fill this field');
				flag = false;
			}

			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			if (!re.test(email)) {
				$(this.email).next().html('Please use valid email');
				flag = false;
			}

		}

		if (flag) this.onSubmit = true;
		else this.onSubmit = false;

		this.setState({ [event.target.name]: event.target.value });
	}

	handleSubmit(event) {
		event.preventDefault();
		if (this.onSubmit === false) return;
		$(this.loader).removeClass('display-none');
		this.props.dispatch(submitContactForm(this.state.name, this.state.email, this.state.tel, this.state.event, this.state.userdetail, this.onSuccess, this.onError));
	}

	filterEvent(eventid) {
		var event = {};
		this.props.events.map(function (item, i) {
			if (item.event_web_id == eventid) event = item;
		})
		return event;
	}

	componentWillMount() {
		this.getUserTimeZone();
	}

	getUserTimeZone() {
		var that = this;
		fetch(
			"https://timezoneapi.io/api/ip"
		).then(function (response) {
			if (response.ok) {
				response.json().then((json) => {
					if (Object.keys(json.data).length) {
						that.setState({
							userdetail: {
								country: (json.data.country && json.data.country != null) ? json.data.country : "",
								state: (json.data.state && json.data.state != null) ? json.data.state : "",
								city: (json.data.city && json.data.city != null) ? json.data.city : "",
								postal: (json.data.postal && json.data.postal != null) ? json.data.postal : "",
								timezone: (json.data.timezone && json.data.timezone != null) ? json.data.timezone.location : ""
							}
						});
					}
				})
			} else {
				that.setState({
					userdetail: {
						country: "",
						state: "",
						city: "",
						postal: "",
						timezone: ""
					}
				});
			}
		});
	}

	componentDidMount() {
		var that = this;
		var state = this.state;
		// Get value from select and load the event;
		$(".selectbox").styler({
			onSelectClosed: function (select) {
				console.log("onSelectClosedFired");
				var eventId = $(that.SelectBox).val() ? $(that.SelectBox).val() : '';

				if (!state.event || !Object.keys(state.event).length) {
					that.state.event = that.filterEvent(eventId);
				}

				eventId = eventId ? '/' + eventId : '';

				var event = Object.keys(state.event).length ? state.event : that.props.events[0];
				var eventState = event.address.state ? that.slugifyUrl(event.address.state) : 'ca';
				var eventCity = event.address.city ? that.slugifyUrl(event.address.city) : 'los-angeles';

				browserHistory.push('/' + eventState + '/' + eventCity + '/' + that.slugifyUrl(event.event_name) + '/' + event.event_web_series_name + eventId);

				that.GAFire();
			},
		});

		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
			$('body').on('change', '.selectbox', () => {
				console.log("OnChangeFired");
				var eventId = $(that.SelectBox).val() ? $(that.SelectBox).val() : '';

				if (!state.event || !Object.keys(state.event).length) {
					that.state.event = that.filterEvent(eventId);
				}

				eventId = eventId ? '/' + eventId : '';

				var event = Object.keys(state.event).length ? state.event : that.props.events[0];
				var eventState = event.address.state ? that.slugifyUrl(event.address.state) : 'ca';
				var eventCity = event.address.city ? that.slugifyUrl(event.address.city) : 'los-angeles';

				browserHistory.push('/' + eventState + '/' + eventCity + '/' + that.slugifyUrl(event.event_name) + '/' + event.event_web_series_name + eventId);

				that.GAFire();
			});
		}
	}

	GAFire(){
		if (this.GAUnlocked) {
			this.GAUnlocked = false;
			ReactGA.initialize('UA-5335998-1');
			ReactGA.pageview(window.location.pathname + window.location.search);
			console.log("==>> window.location.pathname + window.location.search ==>> ", window.location.pathname + window.location.search);
			setTimeout(() => {
				this.GAUnlocked = true;
			}, 5000);
		}
	}
	onError(json) {
		$(this.loader).addClass('display-none');
		this.props.dispatch({
			type: 'CONTACT_FORM_FAILURE',
			messages: Array.isArray(json) ? json : [json]
		});
	}

	onSuccess() {
		var state = this.state
		var eventId = $(this.SelectBox).val() ? $(this.SelectBox).val() : '';

		if (!state.event || !Object.keys(state.event).length) {
			this.state.event = this.filterEvent(eventId);
		}

		var event = state.event ? state.event : this.props.events[0];
		var eventState = event.address.state ? this.slugifyUrl(event.address.state) : 'ca';
		var eventCity = event.address.city ? this.slugifyUrl(event.address.city) : 'los-angeles';
		$(this.loader).addClass('display-none');

		this.props.router.push({
			pathname: '/' + eventState + '/' + eventCity + '/' + this.slugifyUrl(state.event.event_name) + '/' + event.event_web_series_name + '/' + eventId + '/thankyou',
			state: {
				event: this.state.event,
				userEmail: this.state.email
			}
		});
	}

	formatDateTime(event) {
		var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		var startDate = event.event_start.date;
		var endDate = event.event_end.date;

		return month[startDate.month] + ' ' + startDate.date + ': ' + startDate.time_hours + ':' + startDate.time_minutes + ' ' + startDate.am_pm + ' - ' + endDate.time_hours + ':' + endDate.time_minutes + ' ' + endDate.am_pm + " " + '(' + endDate.tz + ')';
	}

	slugifyUrl(string) {
		return string
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^\w\-]+/g, "")
			.replace(/\-\-+/g, "-")
			.replace(/^-+/, "")
			.replace(/-+$/, "");
	}

	render() {
		var that = this;
		var events = this.props.events;
		var eventid = this.props.eventid;
		var style = {
			footerstyle: {
				"color": "#9E9E9E"
			}
		};

		if (eventid) {
			var selected = (<option value="">Select Date</option>);
			var checkIfEvent = (<button className="btn--1 inputs_sset_button inputs_sset">Register for Free <i ref={(loader) => this.loader = loader} className="fa fa-circle-o-notch fa-spin fa-fw display-none" aria-hidden="true"></i></button>);
			var selectBox = events.map(function (item, i) {
				if (eventid == item.event_web_id) {
					that.state.event = item;
					return <option value={item.event_web_id} selected>{that.formatDateTime(item)}</option>
				} else {
					return <option value={item.event_web_id}>{that.formatDateTime(item)}</option>
				}
			})
		} else {
			var selected = (<option value="" selected>Select Date</option>);
			var checkIfEvent = (<button className="disabled btn--1 savespot" disabled>Register for Free</button>);
			var selectBox = events.map(function (item, i) {
				return <option value={item.event_web_id}>{that.formatDateTime(item)}</option>
			})
		}

		var style = {
			highlight: {
				"background": "url(/templates/" + process.env.REACT_TEMPLATE + "/images/highlight_bg.png) no-repeat scroll 50% 50% /cover"
			}
		};

		return (
			<div className="date_box--1">
				<h4>
					Choose a Date & Time
					</h4>
				<form onSubmit={this.handleSubmit.bind(this)} autoComplete="off" className="form-horizontal" >
					<div className="form-group">
						<select className={eventid ? 'selectbox' : 'selectbox no-event'} ref={(select) => { this.SelectBox = select; }}>
							{selected}
							{selectBox}
						</select>
					</div>
					<div className="col-md-12 clearfix contact-error">
						<Messages messages={this.props.messages} />
					</div>
					<div className="form-group">
						<input type="text" ref={(name) => this.name = name} name="name" onfocusout={this.handleChange.bind(this)} onChange={this.handleChange.bind(this)} placeholder="First Name *" required autoComplete="off" />
						<div className="error"></div>
					</div>
					<div className="form-group">
						<input type="email" name="email" ref={(email) => this.email = email} onfocusout={this.handleChange.bind(this)} onChange={this.handleChange.bind(this)} placeholder="Email *" required autoComplete="off" />
						<div className="error"></div>
					</div>
					<div className="form-group">
						<input type="text" ref={(tel) => this.tel = tel} name="tel" onfocusout={this.handleChange.bind(this)} onChange={this.handleChange.bind(this)} placeholder="Phone *" required autoComplete="off" />
						<div className="error"></div>
						{checkIfEvent}
					</div>
					<div className="form_footer--1">
						<div class="col-sm-12 col-xs-12" style={style.footerstyle}>
							We respect your <a href="https://www.artofliving.org/us-en/privacy-policy"> privacy </a>
						</div>
					</div>
				</form>
				<style dangerouslySetInnerHTML={{ __html: ` .error { color: red; text-shadow: #000 1px 1px 1px; font-weight: bolder; } ` }} />
			</div>
		);
	}
}


const mapStateToProps = (state) => {
	return {
		messages: state.messages
	};
};

const connectedContainer = connect(mapStateToProps)(Contact);
const RoutedContainer = withRouter(connectedContainer);
export default RoutedContainer;