import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';

import { brandInfo, placeholders } from '../constants';
import Signature from '../Signature';
import RepliesAndForwards from '../RepliesAndForwards';

import './SignatureContainer.scss';

class SignatureContainer extends Component {
  static defaultButtonText = {
    text: 'Copy text only',
    html: 'Copy Signature'
  };

  constructor(props) {
    super(props);
    this.state = {
      button: {
        buttonClassHtml: 'button is-link',
        buttonTextHtml: SignatureContainer.defaultButtonText.html,
        buttonClassTextSig: 'button',
        buttonTextTextSig: SignatureContainer.defaultButtonText.text,
        buttonClassTextRAF: 'button',
        buttonTextTextRAF: SignatureContainer.defaultButtonText.text,
        buttonClassRAF: 'button is-link',
        buttonTextRAF: SignatureContainer.defaultButtonText.html
      }
    };
  }

  parseMobile = mobileNum => {
    if (mobileNum === undefined) return null;

    const multiSplice = (toAddIndexes, val, array) =>
      toAddIndexes.forEach(index => array.splice(index, 0, val));

    const mobileFormatted = mobileNum.replace(/[\s|+]/g, '');
    const numberArr = mobileFormatted.split('');

    if (mobileFormatted.length === 10) {
      multiSplice([4, 8], '&nbsp;', numberArr);
    } else if (mobileFormatted.length === 11) {
      numberArr.splice(0, 0, '+');
      multiSplice([3, 7, 11], '&nbsp;', numberArr);
    } else if (mobileFormatted.length === 12) {
      multiSplice([3, 7, 11], '&nbsp;', numberArr);
    } else {
      return mobileFormatted;
    }
    return numberArr.join('');
  };

  renderSupportFields = () => {
    const { mobile, email, placeholders, isSupport } = this.props;

    const generateMobileHtml = number => (
      <a
        href={`tel:${this.parseMobile(number).replace(/&nbsp;/g, '')}`}
        dangerouslySetInnerHTML={{ __html: this.parseMobile(number) }}
      />
    );

    const mobileHtml = generateMobileHtml(
      mobile !== '' ? mobile : placeholders.mobile
    );

    const emailHtml = (
      <a href={`mailto:${email || placeholders.email}`}>
        {email || placeholders.email}
      </a>
    );

    const supportHtml = [
      <span>
        |&nbsp;<b>Support&nbsp;Hotline</b>
        <span dangerouslySetInnerHTML={{ __html: brandInfo.supportMobile }} />
        <br />
      </span>,
      <span>
        |&nbsp;<b>Support&nbsp;Email</b>&nbsp;
        <a href={`mailto:${brandInfo.supportEmail}`}>
          {brandInfo.supportEmail}
        </a>
        <br />
      </span>
    ];

    const [supportMobile, supportEmail] = isSupport
      ? supportHtml
      : [<span>&nbsp;&nbsp;</span>, <span>&nbsp;&nbsp;</span>];

    return { mobileHtml, emailHtml, supportMobile, supportEmail };
  };

  setStateFunctionMaker = (beforeState, afterState) => () =>
    this.setState(
      state => ({
        ...state,
        button: {
          ...state.button,
          ...beforeState
        }
      }),
      () =>
        setTimeout(
          () =>
            this.setState(state => ({
              button: {
                ...state.button,
                ...afterState
              }
            })),
          1000
        )
    );

  copyText = text => {
    const container = document.createElement('textarea');
    container.value = text;
    document.body.appendChild(container);
    container.select();
    document.execCommand('copy');
    document.body.removeChild(container);
  };

  copySignatureText = props => {
    const {
      name,
      title,
      qualifications,
      mobile,
      email,
      twitter,
      isSupport
    } = props;
    const mobileText = this.parseMobile(mobile).replace(/&nbsp;/g, ' ');

    const textArr = [
      '--',
      '',
      name ? name : null,
      title ? `Readify | ${title}` : null,
      qualifications ? `${qualifications}` : null,
      '',
      mobileText
        ? `M ${mobileText}${
            isSupport
              ? ` | Support hotline${brandInfo.supportMobile.replace(
                  /&nbsp;/g,
                  ' '
                )}`
              : ''
          }`
        : null,
      email
        ? `E ${email}${
            isSupport ? ` | Support email ${brandInfo.supportEmail}` : ''
          }`
        : null,
      twitter ? `T ${twitter}` : null,
      'W readify.net',
      '',
      'Find us on: Twitter | LinkedIn | Facebook | Youtube'
    ];

    this.copyText(textArr.filter(val => val !== null).join('\n'));

    this.setStateFunctionMaker(
      {
        buttonClassTextSig: 'button is-success fadeColor',
        buttonTextTextSig: 'Copied!'
      },
      {
        buttonClassTextSig: 'button',
        buttonTextTextSig: SignatureContainer.defaultButtonText.text
      }
    )();
  };

  copyRepliesAndForwardsText = props => {
    const { name, title, mobile, email, twitter, isSupport } = props;
    const mobileText = this.parseMobile(mobile).replace(/&nbsp;/g, ' ');

    const textArr = [
      '--',
      `${name}, Readify | ${title}`,
      `M ${mobileText} | E ${email}${twitter ? ` | T ${twitter}` : ''} | W ${
        brandInfo.brandLinkName
      }`,
      isSupport
        ? `Support hotline${brandInfo.supportMobile.replace(
            /&nbsp;/g,
            ' '
          )} | Support email ${brandInfo.supportEmail}`
        : null
    ];

    this.copyText(textArr.filter(val => val !== null).join('\n'));

    this.setStateFunctionMaker(
      {
        buttonClassTextRAF: 'button is-success fadeColor',
        buttonTextTextRAF: 'Copied!'
      },
      {
        buttonClassTextRAF: 'button',
        buttonTextTextRAF: SignatureContainer.defaultButtonText.text
      }
    )();
  };

  copySignature = (props, SignatureComponent, setStateFunction) => {
    // You need to copy the signature as richtext html if you want it to paste nicely into outlook
    // credit: https://stackoverflow.com/questions/34191780/javascript-copy-string-to-clipboard-as-text-html
    const html = ReactDOMServer.renderToStaticMarkup(
      <SignatureComponent {...props} />
    );

    const container = document.createElement('div');
    container.innerHTML = html;

    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';

    document.body.appendChild(container);

    window.getSelection().removeAllRanges();

    const range = document.createRange();
    range.selectNode(container);
    window.getSelection().addRange(range);

    document.execCommand('copy');

    document.body.removeChild(container);

    setStateFunction();
  };

  render() {
    const { brandName, brandLink, brandLinkName, brandLogo } = brandInfo;

    const {
      name,
      title,
      qualifications,
      twitter,
      isSupport,
      mobile,
      email
    } = this.props;

    const {
      mobileHtml,
      emailHtml,
      supportMobile,
      supportEmail
    } = this.renderSupportFields();

    const twitterLink = (
      <a
        href={`https://twitter.com/${twitter.replace('@', '')}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {twitter}
      </a>
    );
    const twitterHtml = twitter ? (
      <span>
        <b>T</b>&nbsp;{twitterLink}&nbsp;&nbsp;&nbsp;
      </span>
    ) : null;

    const signatureHtmlProps = {
      mobile,
      brandLogo,
      name,
      placeholders,
      brandName,
      title,
      isSupport,
      qualifications,
      mobileHtml,
      supportMobile,
      emailHtml,
      email,
      twitter,
      supportEmail,
      twitterHtml,
      brandLink,
      brandLinkName
    };

    const setStateFunctionHTML = this.setStateFunctionMaker(
      {
        buttonClassHtml: 'button is-success fadeColor',
        buttonTextHtml: 'Copied!'
      },
      {
        buttonClassHtml: 'button is-link',
        buttonTextHtml: SignatureContainer.defaultButtonText.html
      }
    );

    const setStateFunctionRAF = this.setStateFunctionMaker(
      {
        buttonClassRAF: 'button is-success fadeColor',
        buttonTextRAF: 'Copied!'
      },
      {
        buttonClassRAF: 'button is-link',
        buttonTextRAF: SignatureContainer.defaultButtonText.html
      }
    );

    const {
      buttonClassHtml,
      buttonTextHtml,
      buttonClassTextSig,
      buttonTextTextSig,
      buttonClassRAF,
      buttonTextRAF,
      buttonClassTextRAF,
      buttonTextTextRAF
    } = this.state.button;

    return (
      <div className="content">
        <div className="level">
          <div className="level-left">
            <h3 className="level-item">Standard Signature</h3>
          </div>
          <div className="level-right">
            <button
              type="button"
              className={buttonClassTextSig}
              onClick={() =>
                this.copySignatureText({
                  ...signatureHtmlProps,
                  placeholders: placeholders
                })
              }
            >
              {buttonTextTextSig}
            </button>
            <button
              type="button"
              className={buttonClassHtml}
              onClick={() =>
                this.copySignature(
                  {
                    ...signatureHtmlProps,
                    placeholders: placeholders
                  },
                  Signature,
                  setStateFunctionHTML
                )
              }
            >
              {buttonTextHtml}
            </button>
          </div>
        </div>
        <Signature {...signatureHtmlProps} />
        <div className="level">
          <div className="level-left">
            <h3 className="level-item">Replies and Forwards Signature</h3>
          </div>
          <div className="level-right">
            <button
              type="button"
              className={buttonClassTextRAF}
              onClick={() =>
                this.copyRepliesAndForwardsText({
                  ...signatureHtmlProps,
                  placeholders: placeholders
                })
              }
            >
              {buttonTextTextRAF}
            </button>
            <button
              type="button"
              className={buttonClassRAF}
              onClick={() =>
                this.copySignature(
                  {
                    ...signatureHtmlProps,
                    placeholders: placeholders
                  },
                  RepliesAndForwards,
                  setStateFunctionRAF
                )
              }
            >
              {buttonTextRAF}
            </button>
          </div>
        </div>
        <RepliesAndForwards {...signatureHtmlProps} />
      </div>
    );
  }
}

export default SignatureContainer;
