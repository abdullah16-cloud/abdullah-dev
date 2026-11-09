import React from 'react';
import './FormField.css';

function injectInputProps(element, props) {
  if (!React.isValidElement(element)) return element;

  // If this element itself is an interactive form control
  if (
    typeof element.type === 'string' &&
    (element.type === 'input' || element.type === 'select' || element.type === 'textarea')
  ) {
    return React.cloneElement(element, props);
  }

  // If it's a wrapper (e.g. password container div), clone props onto the first input/select/textarea inside
  if (element.props && element.props.children) {
    let injected = false;
    const newChildren = React.Children.map(element.props.children, (child) => {
      if (
        !injected &&
        React.isValidElement(child) &&
        typeof child.type === 'string' &&
        (child.type === 'input' || child.type === 'select' || child.type === 'textarea')
      ) {
        injected = true;
        return React.cloneElement(child, props);
      }
      return child;
    });

    return React.cloneElement(element, {}, newChildren);
  }

  return React.cloneElement(element, props);
}

/**
 * Accessible form field wrapper with proper label, error message, and helper text linkage.
 */
function FormField({ id, label, error, helperText, required = false, children, className = '' }) {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const inputProps = {
    id,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
  };

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && (
          <span className="form-required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="form-input-wrapper">{injectInputProps(children, inputProps)}</div>

      {helperText && (
        <span id={helperId} className="form-helper">
          {helperText}
        </span>
      )}

      {error && (
        <span id={errorId} className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
