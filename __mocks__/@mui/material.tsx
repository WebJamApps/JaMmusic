/* eslint-disable @typescript-eslint/no-explicit-any */
export function TextField(props:any) {
  const { children, slotProps, inputProps, inputRef, ...rest } = props;
  const testId = slotProps?.htmlInput?.['data-testid'] || inputProps?.['data-testid'] || rest['data-testid'];
  const style = slotProps?.htmlInput?.style || inputProps?.style || rest.style;
  // real MUI renders `label` as an associated <label>; expose it as the
  // accessible name here so axe sees what real users get
  return <input ref={inputRef} data-testid={testId} style={style} aria-label={rest.label} {...rest}>{children}</input>;
}

export function Checkbox(props:any) {
  const { children } = props;
  return <input type="checkbox" {...props}>{children}</input>;
}

export function Switch(props:any) {
  const { children } = props;
  return <input type="checkbox" {...props}>{children}</input>;
}

export function Divider(props:any) {
  return <hr {...props} />;
}

export function TextareaAutosize(props:any) {
  const { children } = props;
  return <input {...props}>{children}</input>;
}

export function Button(props:any) {
  const { children } = props;
  return <button {...props}>{children}</button>;
}

export function Dialog(props:any) {
  const { children, onClose, open, ...rest } = props;
  return (
    <div data-expanded={open} {...rest}>
      {onClose && (
        <button data-testid="dialog-mock-close-button" onClick={() => onClose()} style={{ display: 'none' }}>
          Mock Close
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogActions(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function DialogContentText(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function DialogContent(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function DialogTitle(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function IconButton(props:any) {
  const { children } = props;
  return <button {...props}>{children}</button>;
}

export function Tooltip(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function FormControl(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function FormGroup(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function FormControlLabel(props:any) {
  const { children, control, label, value, onChange, checked, ...rest } = props;
  const controlWithProps = React.isValidElement(control)
    ? React.cloneElement(control as React.ReactElement<any>, {
        value: (control.props as any).value !== undefined ? (control.props as any).value : value,
        onChange: (control.props as any).onChange !== undefined ? (control.props as any).onChange : onChange,
        checked: (control.props as any).checked !== undefined ? (control.props as any).checked : checked,
      })
    : control;
  return <label {...rest}>{controlWithProps}{label}{children}</label>;
}

export function RadioGroup(props: any) {
  const { children, value, onChange, ...rest } = props;
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      return React.cloneElement(element, {
        checked: element.props.checked !== undefined ? element.props.checked : element.props.value === value,
        onChange: element.props.onChange !== undefined ? element.props.onChange : onChange,
      });
    }
    return child;
  });
  return <div role="radiogroup" {...rest}>{childrenWithProps}</div>;
}

export function Radio(props: any) {
  const { children, checked, ...rest } = props;
  return <input type="radio" checked={checked} {...rest}>{children}</input>;
}

export function Select(props:any) {
  const { children, labelId, ...rest } = props;
  // real MUI wires `labelId` to the combobox's accessible name
  return <select aria-labelledby={labelId} {...rest}>{children}</select>;
}

export function MenuItem(props:any) {
  const { children } = props;
  return <option {...props}>{children}</option>;
}

export function InputLabel(props:any) {
  const { children } = props;
  return <p {...props}>{children}</p>;
}

export function CircularProgress(props:any) {
  return <div {...props} />;
}

export function Box(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function Grid(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function Typography(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function Chip(props:any) {
  return <span {...props} />;
}

export function Table(props:any) {
  const { children } = props;
  return <table {...props}>{children}</table>;
}

export function TableHead(props:any) {
  const { children } = props;
  return <thead {...props}>{children}</thead>;
}

export function TableBody(props:any) {
  const { children } = props;
  return <tbody {...props}>{children}</tbody>;
}

export function TableRow(props:any) {
  const { children } = props;
  return <tr {...props}>{children}</tr>;
}

export function TableCell(props:any) {
  const { children } = props;
  return <td {...props}>{children}</td>;
}

export function TableSortLabel(props:any) {
  const { children, active, direction, ...rest } = props;
  return <span role="button" {...rest}>{children}</span>;
}

export function Card(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function CardContent(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

import * as React from 'react';

export function Tabs(props:any) {
  const { children, value, onChange, ...rest } = props;
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      return React.cloneElement(element, {
        active: element.props.value === value,
        onClick: (e: any) => {
          if (onChange) {
            onChange(e, element.props.value);
          }
          if (element.props.onClick) {
            element.props.onClick(e);
          }
        }
      });
    }
    return child;
  });
  return <div {...rest}>{childrenWithProps}</div>;
}

export function Tab(props:any) {
  const { label, active, ...rest } = props;
  return <button type="button" {...rest}>{label}</button>;
}

export function Alert(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

export function Paper(props:any) {
  const { children } = props;
  return <div {...props}>{children}</div>;
}

// Default to desktop (false) in tests; suites can override per-case.
export function useMediaQuery() {
  return false;
}

export function Accordion(props: any) {
  const { children, expanded, onChange, ...rest } = props;
  return <div data-expanded={expanded} {...rest}>{children}</div>;
}

export function AccordionSummary(props: any) {
  const { children, expandIcon, ...rest } = props;
  return <div {...rest}>{children}</div>;
}

export function AccordionDetails(props: any) {
  const { children, ...rest } = props;
  return <div {...rest}>{children}</div>;
}

export function Autocomplete(props: any) {
  const { options, value, onChange, renderInput, getOptionLabel, ...rest } = props;
  return (
    <div {...rest}>
      {renderInput({})}
    </div>
  );
}

