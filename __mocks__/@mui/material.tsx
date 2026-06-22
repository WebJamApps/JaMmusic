/* eslint-disable @typescript-eslint/no-explicit-any */
export function TextField(props:any) {
  const { children } = props;
  return <input {...props}>{children}</input>;
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
  const { children } = props;
  return <div {...props}>{children}</div>;
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
  const { children, control } = props;
  return <div {...props}>{control}{children}</div>;
}

export function Select(props:any) {
  const { children } = props;
  return <select {...props}>{children}</select>;
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

// Default to desktop (false) in tests; suites can override per-case.
export function useMediaQuery() {
  return false;
}
