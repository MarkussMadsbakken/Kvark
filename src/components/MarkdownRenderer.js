import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// External Imports
import ReactMarkdown from 'react-markdown';
import breaks from 'remark-breaks';

const MarkdownRenderer = (props) => (
    <div className={classNames(props.className, 'renderer')}>
        <ReactMarkdown source={props.value} plugins={[breaks]} escapeHtml={false}/>
    </div>
);

MarkdownRenderer.propTypes = {
    value: PropTypes.string.isRequired,
};

export default MarkdownRenderer;
