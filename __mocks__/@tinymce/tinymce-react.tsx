/* eslint-disable @typescript-eslint/no-explicit-any */
export function Editor(props: any) {
  const { id, value, onEditorChange } = props;
  return (
    <textarea
      id={id}
      data-testid={id}
      value={value ?? ''}
      onChange={(e) => onEditorChange && onEditorChange(e.target.value)}
    />
  );
}
