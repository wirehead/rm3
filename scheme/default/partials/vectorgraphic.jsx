var React = require('react/addons');
var ReactIntl = require('react-intl');
var IntlProvider = ReactIntl.IntlProvider;
var FormattedMessage  = ReactIntl.FormattedMessage;
var JsxForms = require('rm3-react-controls');
var SingleError = JsxForms.SingleError;
var ErrorsList = JsxForms.ErrorsList;
var LinkedStateMixin = require('react-addons-linked-state-mixin');

var VectorGraphicFormComponent = ReactIntl.injectIntl(React.createClass({
  mixins: [LinkedStateMixin],

  getInitialState: function() {
    var state = {};
    if (this.props.errors) {
      state.errors = this.props.errors;
    } else {
      state.errors = {};
    }
    state.title = this.props.title;
    state.abstract = this.props.abstract;
    return state;
  },

  render: function() {
    var buttonMessage = 'submit';
    var self = this;
    var pathBit;
    var minorChange;

    if (this.props.section === 'edit') {
      buttonMessage = 'edit';
      minorChange = (<label htmlFor="minorChange" className="pure-checkbox">
        <input id="minorChange" name="minorChange" type="checkbox" value="true" />
        <FormattedMessage id={'MINOR_CHANGE'} />
        </label>)
    } else {
      pathBit = (<JsxForms.PathNameComponent {...this.props} />);
    }

    return (
      <JsxForms.FormWrapper encType="multipart/form-data" onSubmit={this.onSubmit} proto={this.props.proto} section={this.props.section} revisionId={this.props.revisionId}>
      <fieldset><h1>
       <textarea rows="1" className="pure-input-1" 
        placeholder={this.props.intl.formatMessage({id: "TITLE"})} name="title" 
        valueLink={this.linkState('title')} /></h1>
      <ErrorsList errors={this.state.errors.title} />
      </fieldset>
      <fieldset>
      <textarea rows="5" className="pure-input-1" name="abstract" 
        placeholder={this.props.intl.formatMessage({id:"ABSTRACT"})}
        valueLink={this.linkState('abstract')} >
      </textarea>
      <ErrorsList errors={this.state.errors.abstract} />
      </fieldset>
      {pathBit}

      <fieldset>
      <input type="file" name="svg" />
      </fieldset>

      <ErrorsList errors={this.state.errors.__all__} />

      <fieldset style={{background: 'rgb(237, 237, 237)'}}>
      <textarea rows="1" className="pure-input-1" 
        placeholder={this.props.intl.formatMessage({id:"MEMO"})} name="memo" 
        valueLink={this.linkState('memo')} />
        {minorChange}
      </fieldset>

      <JsxForms.SubmitButton locales={this.props.intl.locales} messages={this.props.intl.messages} isDraft={this.props.isDraft} buttonMessage={buttonMessage} />
      
    </JsxForms.FormWrapper>);
  }
}));

var VectorGraphicFormWrapper = function VectorGraphicWrapper(props) {
  return <IntlProvider messages={props.messages} locale='en'><VectorGraphicFormComponent {...props} /></IntlProvider>
};


module.exports = VectorGraphicFormWrapper;
