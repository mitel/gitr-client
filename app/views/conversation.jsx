/** @jsx React.DOM */

var React = require('react');
var Fluxxor = require('fluxxor');
var Router = require('react-router');
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;
var moment = require('moment');
var Wrapper = require('./wrapper');
var Icon = require('../base/components/icon');
var Spinner = require('react-spinner');

var log = require('bows')('Conversation View');

require('./conversation.scss');

var Conversation = module.exports = React.createClass({
  displayName: 'Conversation',

  mixins: [
    FluxMixin,
    StoreWatchMixin('MatchStore', 'MessageStore', 'LoginStore'),
    Router.State,
  ],

  getStateFromFlux() {
    var MatchStore = this.getFlux().store('MatchStore');
    var MessageStore = this.getFlux().store('MessageStore');
    var LoginStore = this.getFlux().store('LoginStore');

    MatchStore.markSeen(this.getParams().id);

    return {
      me: LoginStore.getProfile(),
      match: MatchStore.get(this.getParams().id),
      messages: MessageStore.getByOtherUserId(this.getParams().id),
    };
  },

  getInitialState() {
    return {
      message: '',
    };
  },

  componentDidMount() {
    this.getFlux().actions.matchFetch(this.getParams().id);
  },

  componentDidUpdate() {
    if (this.refs.messageContainer) {
      this.refs.messageContainer.getDOMNode().scrollTop = this.refs.messageContainer.getDOMNode().scrollHeight;
    }
  },

  handleChange(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    this.setState({
      message: ev.target.value,
    });
  },

  handleSubmit(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var attributes = {
      text: this.state.message,
      matchId: this.state.match.id,
    };

    this.getFlux().actions.messageCreate({id: this.state.match.id}, attributes);

    this.setState({
      message: '',
    });
  },

  render() {
    if (!this.state.match) {
      return (
        <Wrapper leftLink={{to: 'matches', iconType: 'nav-left'}} heading={'loading'}>
          <Spinner />
          <form onSubmit={this.handleSubmit}>
            <div className="Conversation-add">
              <input type="text" className="Conversation-input" placeholder="Send a message" tabIndex="-1" value={this.state.message} onChange={this.handleChange} />
              <Icon className="Conversation-add-submit" type="nav-right" font={false}/>
            </div>
          </form>
        </Wrapper>
      )
    }

    var self = this;

    return (
      <Wrapper leftLink={{to: 'matches', iconType: 'nav-left'}} heading={<Router.Link to="person" params={{id: this.state.match.id}}>{'@' + this.state.match.login}</Router.Link>}>
        <div className="ConversationScroller" ref="messageContainer">
          <div className="Conversation">
            <ul className="Conversation-messages">
              {this.state.messages.map(function(message) {
                var from = (message.from === self.state.match.id) ? "them" : "me";

                return (
                  <li className={'Conversation-message Conversation-message--' + from}>
                    <img src={(from === "me" ? self.state.me : self.state.match).avatarUrl} />
                    <span className="Conversation-message-copy">
                      <p>{message.text}</p>
                      <span className="Conversation-message-time">{moment(message.createdAt).format('ddd h:mma')}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <form onSubmit={this.handleSubmit}>
          <div className="Conversation-add">
            <input type="text" className="Conversation-input" placeholder="Send a message" tabIndex="-1" value={this.state.message} onChange={this.handleChange} />
            <button type="submit" className="Conversation-add-submit"><Icon type="nav-right" font={false}/></button>
          </div>
        </form>
      </Wrapper>
    );
  }
});
