/* eslint-disable @typescript-eslint/no-explicit-any */
export function TextField(props:any) {
  const { children } = props;
  return <input {...props}>{children}</input>;
}

export function Checkbox(props:any) {
  const { children } = props;
  return <input {...props}>{children}</input>;
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
  const { children } = props;
  return <div {...props}>{children}</div>;
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
