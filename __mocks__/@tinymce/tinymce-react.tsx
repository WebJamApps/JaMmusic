/* eslint-disable @typescript-eslint/no-explicit-any */
export function Editor(props: any) {
  const { id, value, onEditorChange } = props;
  return (
    <textarea
      id={id}
      aria-label="rich text editor"
      data-testid={id}
      value={value ?? ''}
      onChange={(e) => onEditorChange && onEditorChange(e.target.value)}
    />
  );
}
