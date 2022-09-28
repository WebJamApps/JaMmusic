/* eslint-disable @typescript-eslint/no-explicit-any */
export function TextField(props:any) {
  return <input {...props}>{props.children}</input>;
}

export function TextareaAutosize(props:any) {
  return <input {...props}>{props.children}</input>;
}

export function Button(props:any) {
  return <button {...props}>{props.children}</button>;
}

export function Dialog(props:any) {
  return <div {...props}>{props.children}</div>;
}

export function DialogActions(props:any) {
  return <div {...props}>{props.children}</div>;
}

export function DialogContentText(props:any) {
  return <div {...props}>{props.children}</div>;
}

export function DialogContent(props:any) {
  return <div {...props}>{props.children}</div>;
}

export function DialogTitle(props:any) {
  return <div {...props}>{props.children}</div>;
}

export function IconButton(props:any) {
  return <button {...props}>{props.children}</button>;
}

export function Tooltip(props:any) {
  return <div {...props}>{props.children}</div>;
}
