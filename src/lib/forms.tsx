import React from 'react';
import { TextField } from '@material-ui/core';

const makeDropdown = (htmlFor: string | undefined,
  value: string | undefined,
  onChange: (event: any) => void, options: string[], style?:any): JSX.Element => (
    <select
      style={style}
      id={htmlFor}
      multiple={false}
      onChange={(event) => onChange(event)}
      value={value}
    >
      {
          options.map((cv) => <option id={cv} key={cv} value={cv}>{cv}</option>)
        }
    </select>
);
const makeInput = (type: string | undefined,
  label: string, isRequired: boolean | undefined,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined,
  value: string, style?:any): JSX.Element => {
  let fId = label.toLowerCase();
  fId = fId.replace(/\s/g, '');
  const fIdArr = fId.split('(');
  // eslint-disable-next-line prefer-destructuring
  fId = fIdArr[0];
  return (
    <TextField
      style={style}
      id={fId}
      placeholder={isRequired ? '* '.concat(label) : label}
      type={type}
      name={fId}
      onChange={onChange}
      value={value || ''}
    />
  );
};

export default { makeInput, makeDropdown };
