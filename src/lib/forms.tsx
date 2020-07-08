import React from 'react';

const makeDropdown = (htmlFor: string | undefined,
  labelText: React.ReactNode, value: string | number | readonly string[] | undefined,
  onChange: (arg0: React.ChangeEvent<HTMLSelectElement>,
    arg1: boolean) => void, options: any[]) => (
      <label htmlFor={htmlFor} style={{ paddingTop: '12px' }} id={htmlFor}>
        {labelText}
        <br />
        <select id={htmlFor} value={value} onChange={(event) => onChange(event, true)}>
          {
          options.map((cv) => <option id={cv} key={cv} value={cv}>{cv}</option>)
        }
        </select>
      </label>
);
const makeInput = (type: string | undefined,
  label: string, isRequired: boolean | undefined,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined,
  value: any, width: any): JSX.Element => {
  let fId = label.toLowerCase();
  fId = fId.replace(/\s/g, '');
  const fIdArr = fId.split('(');
  // eslint-disable-next-line prefer-destructuring
  fId = fIdArr[0];
  return (
    <label className="inquiryLabel" htmlFor={fId}>
      {isRequired ? '* ' : ''}
      {label}
      <br />
      <input
        style={{ paddingLeft: 0, minWidth: 'inherit', width }}
        id={fId}
        type={type}
        name={fId}
        onChange={onChange}
        required={isRequired}
        value={value || ''}
      />
    </label>
  );
};
export default { makeInput, makeDropdown };
